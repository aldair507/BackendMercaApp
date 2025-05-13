"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentaService = void 0;
const venta_model_1 = require("../models/venta/venta.model");
const persona_model_1 = require("../models/persona/persona.model");
const mongoose_1 = __importDefault(require("mongoose"));
class VentaService {
    static async registrarVenta(vendedorId, ventaData) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Validar vendedor - ahora buscamos por _id que viene del token JWT
            // Validar vendedor - ahora buscamos por idPersona en lugar de id
            const vendedor = await persona_model_1.PersonaModel.findOne({
                idPersona: vendedorId, // Aquí usamos idPersona en lugar de id
                rol: { $in: ["vendedor", "administrador"] },
                estadoPersona: true,
            }).session(session);
            console.log("Vendedor encontrado:", vendedor);
            if (!vendedor) {
                throw new Error("Vendedor no válido o no activo");
            }
            // Crear nueva venta
            const nuevaVenta = new venta_model_1.VentaModel({
                ...ventaData,
                vendedor: vendedor._id,
            });
            await nuevaVenta.save({ session });
            // Actualizar vendedor
            await persona_model_1.PersonaModel.findByIdAndUpdate(vendedor._id, { $push: { ventasRealizadas: nuevaVenta._id } }, { session });
            await session.commitTransaction();
            return {
                success: true,
                data: nuevaVenta,
                NombreVendedor: vendedor.nombrePersona,
                ApellidoVendedor: vendedor.apellido,
            };
        }
        catch (error) {
            await session.abortTransaction();
            console.error("Error registrando venta:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error al registrar venta",
            };
        }
        finally {
            session.endSession();
        }
    }
    static async obtenerResumenVentas(filtros) {
        try {
            const { vendedorId, fechaInicio, fechaFin } = filtros;
            const query = {};
            if (vendedorId) {
                query.vendedor = vendedorId;
            }
            if (fechaInicio || fechaFin) {
                query.fechaVenta = {};
                if (fechaInicio)
                    query.fechaVenta.$gte = new Date(fechaInicio);
                if (fechaFin)
                    query.fechaVenta.$lte = new Date(fechaFin);
            }
            const ventas = await venta_model_1.VentaModel.find(query)
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
        }
        catch (error) {
            console.error("Error obteniendo resumen de ventas:", error);
            return {
                success: false,
                error: "Error al obtener resumen de ventas",
            };
        }
    }
}
exports.VentaService = VentaService;
