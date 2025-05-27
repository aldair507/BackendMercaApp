"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentaController = void 0;
const venta_service_1 = require("../services/venta.service");
const comprobante_service_1 = require("../services/comprobante.service");
const venta_model_1 = require("../models/venta.model");
class VentaController {
    static async recibirNotificacion(req, res) {
        try {
            const paymentId = req.query.id || req.body?.data?.id;
            const topic = req.query.topic || req.body?.type;
            console.log("📩 Webhook recibido:", { paymentId, topic });
            if (topic === "payment") {
                // Aquí iría la llamada real a Mercado Pago, simularemos:
                const estadoSimulado = "approved"; // Cambia esto por "rejected", etc.
                const ventaActualizada = await venta_model_1.VentaModel.findOneAndUpdate({ paymentId }, { estadoPago: estadoSimulado }, { new: true });
                console.log("✅ Venta actualizada:", ventaActualizada);
                return res
                    .status(200)
                    .json({ success: true, message: "Pago procesado." });
            }
            res
                .status(400)
                .json({ success: false, message: "Notificación no válida." });
        }
        catch (error) {
            console.error("❌ Error en webhook:", error);
            res
                .status(500)
                .json({ success: false, message: "Error interno del servidor." });
        }
    }
    static async registrarVenta(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado o sin ID válido",
                });
                return;
            }
            const resultadoVenta = await venta_service_1.VentaService.registrarVenta(userId, req.body);
            if (resultadoVenta.success && resultadoVenta.data?.idVenta) {
                try {
                    const tipoComprobante = "factura";
                    const ventaId = resultadoVenta.data.idVenta.trim();
                    console.log("ventaId recibido:", ventaId); // <-- Imprime esto antes del findOne
                    // Usar async/await en lugar de promesas
                    const resultadoComprobante = await comprobante_service_1.ComprobanteService.generarComprobante(ventaId, tipoComprobante);
                    if (!resultadoComprobante.success) {
                        console.error(`Error al generar comprobante para venta ${ventaId}:`, resultadoComprobante.error);
                    }
                    res.status(201).json({
                        ...resultadoVenta,
                        mensaje: `Venta registrada exitosamente. ${resultadoComprobante.success
                            ? "Comprobante generado correctamente."
                            : "El comprobante no pudo generarse."}`,
                        comprobanteGenerado: resultadoComprobante.success,
                    });
                }
                catch (error) {
                    console.error("Error al intentar generar el comprobante:", error);
                    res.status(201).json({
                        ...resultadoVenta,
                        mensaje: "Venta registrada exitosamente. No se pudo generar el comprobante.",
                        errorComprobante: error instanceof Error ? error.message : "Error desconocido",
                    });
                }
            }
            else {
                res.status(400).json({
                    success: false,
                    message: resultadoVenta.error || "Error al registrar la venta",
                    data: resultadoVenta.data,
                });
            }
        }
        catch (error) {
            console.error("Error en controlador de venta:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno del servidor",
            });
        }
    }
    // Controlador con mejor manejo de errores
    // Controlador corregido
    static async obtenerVenta(req, res) {
        try {
            // ✅ Cambiar de req.params.idVenta a req.params.id
            const ventaId = req.params.id;
            console.log('🎯 Controlador - ID recibido:', ventaId);
            if (!ventaId) {
                return res.status(400).json({
                    success: false,
                    error: "Debe proporcionar un ID de venta",
                });
            }
            const resultado = await venta_service_1.VentaService.obtenerVenta(ventaId);
            console.log('📤 Controlador - Resultado del servicio:', {
                success: resultado.success,
                hasData: !!resultado.data,
                error: resultado.error
            });
            if (!resultado.success) {
                return res.status(404).json({
                    success: false,
                    error: resultado.error || "Venta no encontrada",
                    debug: resultado.debug
                });
            }
            res.status(200).json({
                success: true,
                data: resultado.data,
            });
        }
        catch (error) {
            console.error('❌ Error en controlador obtenerVenta:', error);
            res.status(500).json({
                success: false,
                error: "Error interno del servidor"
            });
        }
    }
    static async obtenerTodasLasVentasController(req, res) {
        const result = await venta_service_1.VentaService.obtenerTodasLasVentas();
        if (!result.success) {
            res.status(500).json({ success: false, message: result.error });
            return;
        }
        res.status(200).json(result);
    }
    static async obtenerVentasPorVendedorController(req, res) {
        const { idVendedor } = req.params;
        const result = await venta_service_1.VentaService.obtenerVentasPorVendedor(idVendedor);
        if (!result.success) {
            res.status(404).json({ success: false, message: result.error });
            return;
        }
        res.status(200).json(result);
    }
}
exports.VentaController = VentaController;
