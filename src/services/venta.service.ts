import { VentaModel } from "../models/venta.model";
import { PersonaModel } from "../models/persona.model";
import { ProductoModel } from "../models/producto.model";
import { MercadoPagoService, MercadoPagoData, MercadoPagoResponse } from "./Pago.service";

import { EstrategiaConIVA } from "../interfaces/estrategias/estrategiaIva";
export interface VentaData {
  productos: Array<{
    idProducto: string;
    cantidadVendida: number;
  }>;
  IdMetodoPago: string;
  compradorInfo?: {
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    direccion?: string;
    identificacion?: string;
  };
  redirectUrls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
}

export interface VentaResponse {
  success: boolean;
  data?: any;
  mensaje?: string;
  error?: string;
  mercadoPagoData?: {
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint: string;
    ventaId: string;
    total: number;
  };
}

export class VentaService {
    static async registrarVenta(vendedorId: string, ventaData: VentaData): Promise<VentaResponse> {
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

    // 3. Determinar si es pago en efectivo
    const esEfectivo = ventaData.IdMetodoPago === "MP001";

    // 4. Crear venta
    const nuevaVenta = new VentaModel({
      productos: productosProcesados,
      IdMetodoPago: ventaData.IdMetodoPago,
      total,
      vendedor: vendedorId,
      // Si es efectivo, marcar como completado, si no, como pending
      estadoPago: esEfectivo ? "pagado" : "pendiente",
    });

    await nuevaVenta.save();

    // 5. Actualizar vendedor
    await PersonaModel.updateOne(
      { idPersona: vendedorId },
      { $push: { ventasRealizadas: nuevaVenta.idVenta } }
    );

    // 6. Si NO es efectivo, crear preferencia de MercadoPago
    let mercadoPagoResponse: MercadoPagoResponse | null = null;
            
    if (!esEfectivo) {
       const compradorInfo = {
        email: "cliente@ejemplo.com",
        nombre: "Cliente",
        apellido: "Genérico",
        telefono: "123456789" // opcional si lo necesitas
      };
      // Validar que se proporcionen los datos del comprador para MercadoPago
      if (!compradorInfo) {
        throw new Error("Los datos del comprador son requeridos para pagos con MercadoPago");
      }

      if (!compradorInfo.email || !compradorInfo.nombre || !compradorInfo.apellido) {
        throw new Error("Email, nombre y apellido del comprador son requeridos para MercadoPago");
      }

      const mercadoPagoData: MercadoPagoData = {
        compradorInfo: compradorInfo,
        redirectUrls: ventaData.redirectUrls,
      };

      mercadoPagoResponse = await MercadoPagoService.crearPreferenciaPago(
        nuevaVenta,
        mercadoPagoData
      );

      if (!mercadoPagoResponse.success) {
        // Si falla la creación de la preferencia, revertir la venta
        await VentaModel.deleteOne({ idVenta: nuevaVenta.idVenta });
        await PersonaModel.updateOne(
          { idPersona: vendedorId },
          { $pull: { ventasRealizadas: nuevaVenta.idVenta } }
        );

        // Revertir stock de productos
        for (const producto of productosProcesados) {
          await ProductoModel.updateOne(
            { idProducto: producto.idProducto },
            { $inc: { cantidad: producto.cantidadVendida } }
          );
        }

        throw new Error(`Error al crear preferencia de MercadoPago: ${mercadoPagoResponse.error}`);
      }
    }

    const response: VentaResponse = {
      success: true,
      data: nuevaVenta,
      mensaje: esEfectivo 
        ? "Venta registrada correctamente (Pago en efectivo)"
        : "Venta registrada correctamente. Redirigir al usuario para completar el pago.",
    };

    // Incluir datos de MercadoPago si están disponibles
    if (mercadoPagoResponse?.success && mercadoPagoResponse.data) {
      response.mercadoPagoData = mercadoPagoResponse.data;
    }

    return response;

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al registrar venta",
    };
  }
}

  /**
   * Procesar productos y actualizar stock
   */
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

  /**
   * Obtener venta por ID
   */
  static async obtenerVenta(ventaId: string) {
    try {
      const venta = await VentaModel.findOne({ idVenta: ventaId });
      
      if (!venta) {
        return {
          success: false,
          error: "Venta no encontrada",
        };
      }

      return {
        success: true,
        data: venta,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al obtener venta",
      };
    }
  }

  /**
   * Marcar venta como completada (para pagos en efectivo o confirmación manual)
   */
  static async completarVenta(ventaId: string) {
    try {
      const venta = await VentaModel.updateOne(
        { idVenta: ventaId },
        { $set: { estadoPago: "completed" } }
      );

      if (venta.matchedCount === 0) {
        return {
          success: false,
          error: "Venta no encontrada",
        };
      }

      return {
        success: true,
        mensaje: "Venta marcada como completada",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al completar venta",
      };
    }
  }

  /**
   * Cancelar venta y revertir stock
   */
  static async cancelarVenta(ventaId: string) {
    try {
      const venta = await VentaModel.findOne({ idVenta: ventaId });
      
      if (!venta) {
        return {
          success: false,
          error: "Venta no encontrada",
        };
      }

      if (venta.estadoPago === "cancelled") {
        return {
          success: false,
          error: "No se puede cancelar una venta ya cancelada",
        };
      }

      // Revertir stock
      for (const producto of venta.productos) {
        await ProductoModel.updateOne(
          { idProducto: producto.idProducto },
          { $inc: { cantidad: producto.cantidadVendida } }
        );
      }

      // Actualizar estado de la venta
      await VentaModel.updateOne(
        { idVenta: ventaId },
        { $set: { estadoPago: "cancelled" } }
      );

      // Remover de ventas realizadas del vendedor
      await PersonaModel.updateOne(
        { idPersona: venta.vendedor },
        { $pull: { ventasRealizadas: ventaId } }
      );

      return {
        success: true,
        mensaje: "Venta cancelada correctamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al cancelar venta",
      };
    }
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