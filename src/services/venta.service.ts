import { VentaModel } from "../models/venta/venta.model";
import { PersonaModel } from "../models/persona/persona.model";
import { ProductoModel } from "../models/producto/producto.model";
import { Inventario } from "./inventario.service";
import mongoose from "mongoose";

export class VentaService {
  static async registrarVenta(vendedorId: string, ventaData: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const vendedor = await PersonaModel.findOne({
        idPersona: vendedorId,
        rol: { $in: ["vendedor", "administrador"] },
        estadoPersona: true,
      }).session(session);

      if (!vendedor) {
        throw new Error("Vendedor no válido o no activo");
      }

      const productos = ventaData.productos;
      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        throw new Error("No se proporcionaron productos para la venta");
      }

      // Procesamos solo el primer producto por simplicidad
      const primerProductoVenta = productos[0];
      const { idProducto, cantidadVendida } = primerProductoVenta;

      if (!idProducto || !cantidadVendida) {
        throw new Error("Faltan datos de producto o cantidad");
      }

      const producto = await ProductoModel.findOne({
        idProducto,
        estado: true,
      }).session(session);
      if (!producto) {
        throw new Error("Producto no encontrado o inactivo");
      }

      // Validar stock
      if (producto.cantidad < cantidadVendida) {
        throw new Error(`Stock insuficiente para ${producto.nombre}`);
      }

      // Calcular precio con descuento y total
      const precioUnitario = producto.precio;
      const descuento = producto.descuento || 0;
      const precioConDescuento =
        precioUnitario - (precioUnitario * descuento) / 100;
      const total = precioConDescuento * cantidadVendida;

      // Actualizar stock
      const inventario = new Inventario();
      await inventario.actualizarStock(idProducto, cantidadVendida);

      // Crear venta
      const nuevaVenta = new VentaModel({
        productos: productos,
        IdMetodoPago: ventaData.IdMetodoPago,
        total: ventaData.total,
        vendedor: vendedorId,
      });

      await nuevaVenta.save({ session });

      // Asociar venta al vendedor
      await PersonaModel.findByIdAndUpdate(
        vendedorId,
        { $push: { ventasRealizadas: nuevaVenta._id } },
        { session }
      );

      await session.commitTransaction();

      return {
        success: true,
        data: nuevaVenta,
        mensaje: `Venta registrada de ${producto.nombre} (${cantidadVendida} unidades)`,
      };
    } catch (error) {
      await session.abortTransaction();
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error al registrar venta",
      };
    } finally {
      session.endSession();
    }
  }
  static async obtenerTodasLasVentas() {
    try {
      const ventas = await VentaModel.find()
        .populate("vendedor", "nombrePersona rol")

        .populate("productos.idProducto", "nombre precio"); // Traer datos del producto

      return {
        success: true,
        data: ventas,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error al obtener ventas",
      };
    }
  }

  // Obtener ventas por vendedor
  static async obtenerVentasPorVendedor(vendedorId: string) {
    try {
      const vendedor = await PersonaModel.findOne({
        idPersona: vendedorId,
        rol: { $in: ["vendedor", "administrador"] },
        estadoPersona: true,
      });

      if (!vendedor) {
        return {
          success: false,
          error: "Vendedor no válido o no activo",
        };
      }

      const ventas = await VentaModel.find({ vendedor: vendedorId })
        .populate("productos.idProducto", "nombre precio")
        .populate("vendedor", "nombre");

      return {
        success: true,
        data: ventas,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener ventas del vendedor",
      };
    }
  }
}
