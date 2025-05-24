import { VentaModel } from "../models/venta.model";
import { PersonaModel } from "../models/persona.model";
import { ProductoModel } from "../models/producto.model";
import { EstrategiaConIVA } from "../interfaces/estrategias/estrategiaIva";

export class VentaService {
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
      });

      await nuevaVenta.save();

      // 4. Actualizar vendedor
      await PersonaModel.updateOne(
        { idPersona: vendedorId },
        { $push: { ventasRealizadas: nuevaVenta.idVenta } }
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