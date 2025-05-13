import { VentaModel } from "../models/venta/venta.model";
import { PersonaModel } from "../models/persona/persona.model";
import mongoose from "mongoose";

export class VentaService {
  static async registrarVenta(vendedorId: string, ventaData: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validar vendedor - ahora buscamos por _id que viene del token JWT
      // Validar vendedor - ahora buscamos por idPersona en lugar de id
      const vendedor = await PersonaModel.findOne({
        idPersona: vendedorId, // Aquí usamos idPersona en lugar de id
        rol: { $in: ["vendedor", "administrador"] },
        estadoPersona: true,
      }).session(session);

      console.log("Vendedor encontrado:", vendedor);
      if (!vendedor) {
        throw new Error("Vendedor no válido o no activo");
      }

      // Crear nueva venta
      const nuevaVenta = new VentaModel({
        ...ventaData,
        vendedor: vendedor._id,
      });

      await nuevaVenta.save({ session });

      // Actualizar vendedor
      await PersonaModel.findByIdAndUpdate(
        vendedor._id,
        { $push: { ventasRealizadas: nuevaVenta._id } },
        { session }
      );

      await session.commitTransaction();

      return {
        success: true,
        data: nuevaVenta,
        NombreVendedor: vendedor.nombrePersona,
        ApellidoVendedor: vendedor.apellido,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error("Error registrando venta:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error al registrar venta",
      };
    } finally {
      session.endSession();
    }
  }

  static async obtenerResumenVentas(filtros: {
    vendedorId?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
  }) {
    try {
      const { vendedorId, fechaInicio, fechaFin } = filtros;
      const query: any = {};

      if (vendedorId) {
        query.vendedor = vendedorId;
      }

      if (fechaInicio || fechaFin) {
        query.fechaVenta = {};
        if (fechaInicio) query.fechaVenta.$gte = new Date(fechaInicio);
        if (fechaFin) query.fechaVenta.$lte = new Date(fechaFin);
      }

      const ventas = await VentaModel.find(query)
        .populate({
          path: "vendedor",
          select: "codigoVendedor nombrePersona apellido",
        })
        .sort({ fechaVenta: -1 })
        .lean();

      const total = ventas.reduce((sum, venta) => sum + venta.total, 0);

      return {
        success: true,
        data: {
          ventas: ventas.map((v) => ({
            idVenta: v.idVenta,
            fechaVenta: v.fechaVenta,
            total: v.total,
            vendedor: {
              _id: v.vendedor._id,
              codigoVendedor: v.vendedor.id,
            },
          })),
          total,
          cantidadVentas: ventas.length,
        },
      };
    } catch (error) {
      console.error("Error obteniendo resumen de ventas:", error);
      return {
        success: false,
        error: "Error al obtener resumen de ventas",
      };
    }
  }
}
