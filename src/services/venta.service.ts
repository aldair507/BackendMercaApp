import { VentaModel } from "../models/venta.model";
import { PersonaModel } from "../models/persona.model";
import { ProductoModel } from "../models/producto.model";
import { EstrategiaConIVA } from "../interfaces/estrategias/estrategiaIva";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { ACCESS_TOKEN } from "../config/server.config";
import { Request, Response } from "express";
import { PaymentResponse } from "../interfaces/PaymentReponse";

const client = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN ?? (() => { throw new Error("ACCESS_TOKEN is undefined"); })(),
  options: {
    timeout: 5000,
  },
});

interface VentaConPago {
  vendedorId: string;
  productos: Array<{
    idProducto: string;
    cantidadVendida: number;
  }>;
  compradorInfo: {
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    direccion?: string;
  };
}

export class VentaService {
  // Crear orden de pago con datos reales de productos
  static async crearOrdenPago(req: Request, res: Response) {
    try {
      const { vendedorId, productos, compradorInfo }: VentaConPago = req.body;

      // 1. Validar vendedor
      const vendedor = await PersonaModel.findOne({
        idPersona: vendedorId,
        rol: { $in: ["vendedor", "administrador"] },
        estadoPersona: true,
      });

      if (!vendedor) {
        return res.status(404).json({
          success: false,
          error: "Vendedor no válido o no activo"
        });
      }

      // 2. Procesar productos y calcular precios
      const productosProcesados = await this.validarYProcesarProductos(productos);
      const itemsParaMercadoPago = productosProcesados.map(producto => ({
        id: producto.idProducto,
        title: producto.nombre,
        description: `${producto.nombre} - ${producto.categoria}`,
        category_id: producto.categoria,
        quantity: producto.cantidadVendida,
        unit_price: producto.precioUnitario,
        currency_id: "COP" // o la moneda que uses
      }));

      // 3. Configurar información del comprador
      const payer = {
        email: compradorInfo.email,
        first_name: compradorInfo.nombre,
        last_name: compradorInfo.apellido,
        ...(compradorInfo.telefono && {
          phone: {
            area_code: "1",
            number: compradorInfo.telefono,
          }
        }),
        ...(compradorInfo.direccion && {
          address: {
            street_name: compradorInfo.direccion,
            zip_code: "00000",
          }
        })
      };

      // 4. Crear preferencia de pago
      const preference = new Preference(client);
      const ventaId = `venta-${Date.now()}-${vendedorId}`;

      const result = await preference.create({
        body: {
          items: itemsParaMercadoPago,
          payer,
          external_reference: ventaId, // ID único para rastrear la venta
          metadata: {
            vendedor_id: vendedorId,
            productos: JSON.stringify(productos)
          },
          redirect_urls: {
            success: `${process.env.BASE_URL}/api/pagos/success`,
            failure: `${process.env.BASE_URL}/api/pagos/failure`,
            pending: `${process.env.BASE_URL}/api/pagos/pending`,
          },
          back_urls: {
            success: `${process.env.BASE_URL}/api/pagos/success`,
            failure: `${process.env.BASE_URL}/api/pagos/failure`,
            pending: `${process.env.BASE_URL}/api/pagos/pending`,
          },
          auto_return: "approved",
        },
        requestOptions: {
          timeout: 5000,
        },
      });

      console.log("Orden de pago creada:", result);

      res.status(200).json({
        success: true,
        data: {
          preference_id: result.id,
          init_point: result.init_point,
          sandbox_init_point: result.sandbox_init_point,
          external_reference: ventaId
        },
        mensaje: "Orden de pago creada correctamente"
      });

    } catch (error) {
      console.log("Error al crear orden de pago:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Error al crear la orden de pago"
      });
    }
  }

  // Procesar pago exitoso
  static async procesarPagoExitoso(req: Request, res: Response) {
    try {
      const data = req.query as unknown as PaymentResponse;
      console.log("Pago exitoso recibido:", data);

      if (data.status === "approved" && data.external_reference) {
        // Obtener los metadatos de la preferencia para recuperar los datos de la venta
        const preference = new Preference(client);
        const preferenceData = await preference.get({ preferenceId: data.preference_id });
        
        const vendedorId = preferenceData.metadata?.vendedor_id;
        const productos = JSON.parse(preferenceData.metadata?.productos || "[]");

        if (vendedorId && productos.length > 0) {
          // Registrar la venta en la base de datos
          const ventaData = {
            productos,
            IdMetodoPago: "mercadopago",
            paymentId: data.payment_id,
            externalReference: data.external_reference,
            estadoPago: "approved" as const
          };

          const resultado = await this.registrarVenta(vendedorId, ventaData);
          
          if (resultado.success) {
            res.status(200).json({
              success: true,
              message: "Pago procesado y venta registrada correctamente",
              data: {
                venta: resultado.data,
                payment: data
              }
            });
          } else {
            console.error("Error al registrar venta:", resultado.error);
            res.status(500).json({
              success: false,
              message: "Pago exitoso pero error al registrar venta",
              error: resultado.error
            });
          }
        } else {
          res.status(400).json({
            success: false,
            message: "Datos de venta no encontrados en la preferencia"
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: "Pago no aprobado o datos incompletos"
        });
      }

    } catch (error) {
      console.log("Error procesando pago exitoso:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Error al procesar el pago"
      });
    }
  }

  // Procesar pago fallido
  static async procesarPagoFallido(req: Request, res: Response) {
    try {
      const data = req.query as unknown as PaymentResponse;
      console.log("Pago fallido recibido:", data);

      // Aquí podrías registrar el intento fallido o enviar notificaciones
      res.status(200).json({
        success: false,
        message: "Pago fallido",
        data
      });

    } catch (error) {
      console.log("Error procesando pago fallido:", error);
      res.status(500).json({
        success: false,
        error: "Error al procesar el pago fallido"
      });
    }
  }

  // Procesar pago pendiente
  static async procesarPagoPendiente(req: Request, res: Response) {
    try {
      const data = req.query as unknown as PaymentResponse;
      console.log("Pago pendiente recibido:", data);

      // Aquí podrías registrar el estado pendiente
      res.status(200).json({
        success: true,
        message: "Pago pendiente",
        data
      });

    } catch (error) {
      console.log("Error procesando pago pendiente:", error);
      res.status(500).json({
        success: false,
        error: "Error al procesar el pago pendiente"
      });
    }
  }

  // Validar productos antes de crear la orden
  private static async validarYProcesarProductos(productos: any[]) {
    if (!productos?.length) {
      throw new Error("Debe incluir al menos un producto");
    }

    const estrategia = new EstrategiaConIVA();
    const resultados = [];

    for (const producto of productos) {
      const productoBD = await ProductoModel.findOne({
        idProducto: producto.idProducto,
        estado: true,
      });

      if (!productoBD) {
        throw new Error(`Producto ${producto.idProducto} no encontrado o inactivo`);
      }

      if (productoBD.cantidad < producto.cantidadVendida) {
        throw new Error(`Stock insuficiente para ${productoBD.nombre}`);
      }

      // Calcular subtotal
      const subtotal = estrategia.calcularSubtotal(
        productoBD.precio,
        producto.cantidadVendida,
        productoBD.descuento || 0,
        productoBD.impuestos || 0
      );

      resultados.push({
        idProducto: productoBD.idProducto,
        nombre: productoBD.nombre,
        categoria: productoBD.categoria,
        cantidadVendida: producto.cantidadVendida,
        precioUnitario: productoBD.precio,
        descuento: productoBD.descuento || 0,
        impuestos: productoBD.impuestos || 0,
        subtotal,
      });
    }

    return resultados;
  }

  static async registrarVenta(vendedorId: string, ventaData: any) {
    try {
      // 1. Validar vendedor
      const vendedor = await PersonaModel.findOne({
        idPersona: vendedorId,
        rol: { $in: ["vendedor", "administrador"] },
        estadoPersona: true,
      });

      if (!vendedor) {
        throw new Error("Vendedor no válido o no activo");
      }

      // 2. Procesar productos y calcular total
      const productosProcesados = await this.procesarProductos(ventaData.productos);
      const total = productosProcesados.reduce((sum, p) => sum + p.subtotal, 0);

      // 3. Crear venta
      const nuevaVenta = new VentaModel({
        productos: productosProcesados,
        IdMetodoPago: ventaData.IdMetodoPago,
        total,
        vendedor: vendedorId,
        paymentId: ventaData.paymentId, // ID del pago de MercadoPago
        externalReference: ventaData.externalReference, // Referencia externa
        fechaVenta: new Date(),
      });

      await nuevaVenta.save();

      // 4. Actualizar vendedor (usando ObjectId en lugar de string)
      await PersonaModel.updateOne(
        { _id: vendedorId }, // Usar _id si tu modelo usa ObjectId
        { $push: { ventasRealizadas: nuevaVenta._id } }
      );

      return {
        success: true,
        data: nuevaVenta,
        mensaje: "Venta registrada correctamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al registrar venta",
      };
    }
  }

  private static async procesarProductos(productos: any[]) {
    if (!productos?.length) {
      throw new Error("Debe incluir al menos un producto");
    }

    const estrategia = new EstrategiaConIVA();
    const resultados = [];

    for (const producto of productos) {
      const productoBD = await ProductoModel.findOne({
        idProducto: producto.idProducto,
        estado: true,
      });

      if (!productoBD) {
        throw new Error(`Producto ${producto.idProducto} no encontrado o inactivo`);
      }

      if (productoBD.cantidad < producto.cantidadVendida) {
        throw new Error(`Stock insuficiente para ${productoBD.nombre}`);
      }

      // Calcular subtotal
      const subtotal = estrategia.calcularSubtotal(
        productoBD.precio,
        producto.cantidadVendida,
        productoBD.descuento || 0,
        productoBD.impuestos || 0
      );

      // Actualizar stock
      await ProductoModel.updateOne(
        { idProducto: productoBD.idProducto },
        { $inc: { cantidad: -producto.cantidadVendida } }
      );

      resultados.push({
        idProducto: productoBD.idProducto,
        nombre: productoBD.nombre,
        categoria: productoBD.categoria,
        cantidadVendida: producto.cantidadVendida,
        precioUnitario: productoBD.precio,
        descuento: productoBD.descuento || 0,
        impuestos: productoBD.impuestos || 0,
        subtotal,
      });
    }

    return resultados;
  }

  static async obtenerTodasLasVentas() {
    try {
      const [ventas, productos] = await Promise.all([
        VentaModel.find().lean(),
        ProductoModel.find().select("idProducto nombre categoria").lean()
      ]);

      const productosMap = new Map(productos.map(p => [p.idProducto, p]));
      
      const ventasConDatos = await Promise.all(
        ventas.map(async (venta) => {
          const vendedor = await PersonaModel.findOne({ idPersona: venta.vendedor })
            .select("idPersona nombrePersona apellido")
            .lean();

          const productosConDatos = venta.productos.map(pv => ({
            ...pv,
            producto: productosMap.get(pv.idProducto) || {
              nombre: "Producto no encontrado",
              categoria: "Sin categoría",
            },
          }));

          return {
            ...venta,
            vendedor: vendedor || { nombrePersona: "No disponible", apellido: "" },
            productos: productosConDatos,
          };
        })
      );

      return {
        success: true,
        data: ventasConDatos,
        mensaje: "Ventas obtenidas correctamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al obtener ventas",
      };
    }
  }

  static async obtenerVentasPorVendedor(idPersona: string) {
    try {
      const [persona, ventas] = await Promise.all([
        PersonaModel.findOne({ idPersona }).select("idPersona nombrePersona apellido").lean(),
        VentaModel.find({ vendedor: idPersona }).lean()
      ]);

      if (!persona) {
        return { success: false, mensaje: "Vendedor no encontrado" };
      }

      if (!ventas.length) {
        return {
          success: true,
          data: [],
          mensaje: "No se encontraron ventas para este vendedor",
        };
      }

      const productosIds = [...new Set(ventas.flatMap(v => v.productos.map(p => p.idProducto)))];
      const productos = await ProductoModel.find({ idProducto: { $in: productosIds } })
        .select("idProducto nombre categoria")
        .lean();

      const productosMap = new Map(productos.map(p => [p.idProducto, p]));

      const ventasConDatos = ventas.map(venta => ({
        ...venta,
        vendedor: persona,
        productos: venta.productos.map(pv => ({
          ...pv,
          producto: productosMap.get(pv.idProducto) || {
            nombre: "Producto no encontrado",
            categoria: "Sin categoría",
          },
        })),
      }));

      return {
        success: true,
        data: ventasConDatos,
        mensaje: "Ventas por vendedor obtenidas correctamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al obtener ventas por vendedor",
      };
    }
  }
}