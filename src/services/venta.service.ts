import { VentaModel } from "../models/venta/venta.model";
import { PersonaModel } from "../models/persona/persona.model";
import { ProductoModel } from "../models/producto/producto.model";

export class VentaService {
  static async registrarVenta(vendedorId: string, ventaData: any) {
    try {
      // 1. Validar vendedor por idPersona
      const vendedor = await PersonaModel.findOne({
        idPersona: vendedorId,
        rol: { $in: ["vendedor", "administrador"] },
        estadoPersona: true,
      });

      if (!vendedor) {
        throw new Error("Vendedor no válido o no activo");
      }

      // 2. Validar y procesar productos
      const productosProcesados = await this.procesarProductos(
        ventaData.productos
      );

      // 3. Calcular total
      const total = productosProcesados.reduce((sum, p) => sum + p.subtotal, 0);

      // 4. Crear y guardar venta
      const nuevaVenta = new VentaModel({
        productos: productosProcesados,
        IdMetodoPago: ventaData.IdMetodoPago,
        total,
        vendedor: vendedorId,
      });

      await nuevaVenta.save();

      // 5. Actualizar vendedor (creará el campo si no existe)
      await this.actualizarVentasVendedor(vendedorId, nuevaVenta.idVenta);

      return {
        success: true,
        data: await nuevaVenta,
        mensaje: "Venta registrada correctamente",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error al registrar venta",
      };
    }
  }

  private static async procesarProductos(productos: any[]) {
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      throw new Error("Debe incluir al menos un producto");
    }

    const resultados = [];

    for (const producto of productos) {
      const productoBD = await ProductoModel.findOne({
        idProducto: producto.idProducto,
        estado: true,
      });

      if (!productoBD) {
        throw new Error(
          `Producto ${producto.idProducto} no encontrado o inactivo`
        );
      }

      if (productoBD.cantidad < producto.cantidadVendida) {
        throw new Error(`Stock insuficiente para ${productoBD.nombre}`);
      }

      // Cálculos
      const precioUnitario = productoBD.precio;
      const descuento = productoBD.descuento || 0;
      const impuestos = productoBD.impuestos || 0;
      const subtotal = precioUnitario * producto.cantidadVendida;
      const descuentoAplicado = subtotal * (descuento / 100);
      const impuestosAplicados =
        (subtotal - descuentoAplicado) * (impuestos / 100);
      const subtotalConImpuestos =
        subtotal - descuentoAplicado + impuestosAplicados;

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
        precioUnitario,
        descuento,
        impuestos,
        subtotal: subtotalConImpuestos,
      });
    }

    return resultados;
  }

  private static async actualizarVentasVendedor(
    vendedorId: string,
    ventaId: any
  ) {
    // Esta operación creará el campo ventasRealizadas si no existe
    const result = await PersonaModel.updateOne(
      { idPersona: vendedorId },
      { $push: { ventasRealizadas: ventaId } }
    );

    if (result.matchedCount === 0) {
      throw new Error("No se encontró el vendedor para actualizar");
    }
  }

  static async obtenerTodasLasVentas() {
    try {
      const ventas = await VentaModel.find().lean();

      // Obtener todos los IDs de productos únicos
      const todosProductosIds = [
        ...new Set(ventas.flatMap((v) => v.productos.map((p) => p.idProducto))),
      ];

      // Buscar todos los productos relevantes en una sola consulta
      const productos = await ProductoModel.find({
        idProducto: { $in: todosProductosIds },
      })
        .select("idProducto nombre categoria")
        .lean();

      // Crear mapa para acceso rápido a productos por ID
      const productosMap = new Map(productos.map((p) => [p.idProducto, p]));

      // Procesar todas las ventas con Promise.all para manejar las consultas en paralelo
      const ventasConDatos = await Promise.all(
        ventas.map(async (venta) => {
          // Obtener vendedor
          const vendedor = await PersonaModel.findOne({
            idPersona: venta.vendedor,
          })
            .select("idPersona nombrePersona apellido")
            .lean();

          // Procesar productos de la venta
          const productosConDatos = venta.productos.map((productoVenta) => {
            const producto = productosMap.get(productoVenta.idProducto) || {
              nombre: "Producto no encontrado",
              categoria: "Sin categoría",
            };

            return {
              ...productoVenta,
              producto: {
                nombre: producto.nombre,
                categoria: producto.categoria,
              },
            };
          });

          // Retornar venta con datos enriquecidos
          return {
            ...venta,
            vendedor: vendedor || {
              nombrePersona: "No disponible",
              apellido: "",
            },
            productos: productosConDatos,
          };
        })
      );

      return {
        success: true,
        data: ventasConDatos,
        mensaje: "Ventas con datos mínimos obtenidas correctamente",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error al obtener ventas",
      };
    }
  }

  static async obtenerVentasPorVendedor(idPersona: string) {
    try {
      console.log("Buscando ventas para vendedor con ID:", idPersona);

      // Verificar si el ID es un ObjectId válido para MongoDB
      const mongoose = require("mongoose");

      // Usar 'any' para evitar problemas de tipo con operadores de MongoDB
      let query: any = { vendedor: idPersona };

      // Si parece ser un ObjectId válido, asegurarnos de que funcione con ambos formatos
      if (mongoose.Types.ObjectId.isValid(idPersona)) {
        // Crear una consulta OR que busque tanto el string como el ObjectId
        query = {
          $or: [
            { vendedor: idPersona },
            { vendedor: new mongoose.Types.ObjectId(idPersona) },
          ],
        };
      }

      // Obtener ventas del vendedor específico con el query mejorado
      const ventas = await VentaModel.find(query).lean();
      console.log(
        `Se encontraron ${ventas.length} ventas para el vendedor ${idPersona}`
      );

      if (ventas.length === 0) {
        return {
          success: true,
          data: [],
          mensaje: "No se encontraron ventas para este vendedor",
        };
      }

      // Obtener todos los IDs de productos únicos
      const todosProductosIds = [
        ...new Set(ventas.flatMap((v) => v.productos.map((p) => p.idProducto))),
      ];

      // Buscar todos los productos relevantes en una sola consulta
      const productos = await ProductoModel.find({
        idProducto: { $in: todosProductosIds },
      })
        .select("idProducto nombre categoria")
        .lean();

      // Crear mapa para acceso rápido a productos por ID
      const productosMap = new Map(productos.map((p) => [p.idProducto, p]));

      let vendedor = await PersonaModel.findOne({ idPersona })
        .select("idPersona nombrePersona apellido")
        .lean();

      const vendedorInfo = vendedor || {
        _id: idPersona,
        nombrePersona: "No disponible",
        apellido: "",
      };

      // Procesar todas las ventas añadiendo información de productos
      const ventasConDatos = ventas.map((venta) => {
        // Procesar productos de la venta
        const productosConDatos = venta.productos.map((productoVenta) => {
          const producto = productosMap.get(productoVenta.idProducto) || {
            nombre: "Producto no encontrado",
            categoria: "Sin categoría",
          };

          return {
            ...productoVenta,
            producto: {
              nombre: producto.nombre,
              categoria: producto.categoria,
            },
          };
        });

        // Retornar venta con datos enriquecidos
        return {
          ...venta,
          vendedor: vendedorInfo,
          productos: productosConDatos,
          idVenta: venta._id.toString(),
        };
      });

      return {
        success: true,
        data: ventasConDatos,
        mensaje: "Ventas por vendedor obtenidas correctamente",
      };
    } catch (error) {
      console.error("Error al obtener ventas por vendedor:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener ventas por vendedor",
      };
    }
  }

  /**
   * Versión alternativa: Obtiene ventas con datos básicos de referencia
   */
}
