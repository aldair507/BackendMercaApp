"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSale = exports.completeSale = exports.getPaymentStatus = exports.webhook = exports.pending = exports.failure = exports.success = exports.createSale = void 0;
const venta_service_1 = require("../services/venta.service");
const Pago_service_1 = require("../services/Pago.service");
/**
 * Crear venta (con integración automática de MercadoPago si no es efectivo)
 */
const createSale = async (req, res) => {
    try {
        const { vendedorId, productos, IdMetodoPago = "mercadopago", redirectUrls, } = req.body;
        // Validar datos requeridos
        if (!vendedorId || !productos) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos requeridos: vendedorId, productos",
            });
        }
        // Datos del comprador quemados (estáticos)
        const compradorInfo = {
            email: "mercaap@mail.com",
            nombre: "cliente",
            apellido: "mercaap",
            telefono: "3124569874",
            direccion: "popayan cauca",
        };
        // Registrar venta (incluye integración con MercadoPago si aplica)
        const resultado = await venta_service_1.VentaService.registrarVenta(vendedorId, {
            productos,
            IdMetodoPago,
            compradorInfo,
            redirectUrls,
        });
        if (!resultado.success) {
            return res.status(400).json(resultado);
        }
        // Construir respuesta
        const response = {
            success: true,
            data: {
                ventaId: resultado.data.idVenta,
                total: resultado.data.total,
                metodoPago: IdMetodoPago,
                estadoPago: resultado.data.estadoPago,
            },
            mensaje: resultado.mensaje,
        };
        // Si hay datos de MercadoPago, incluirlos
        if (resultado.mercadoPagoData) {
            response.data.mercadoPago = resultado.mercadoPagoData;
        }
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error al crear venta:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido",
        });
    }
};
exports.createSale = createSale;
/**
 * Manejar pago exitoso (callback de MercadoPago)
 */
const success = async (req, res) => {
    try {
        const data = req.query;
        console.log("Pago exitoso recibido:", data);
        const resultado = await Pago_service_1.MercadoPagoService.procesarPagoExitoso(data.payment_id, data.external_reference ?? "");
        res.status(200).json({
            success: resultado,
            message: resultado
                ? "Pago realizado exitosamente"
                : "Error procesando el pago",
            data,
        });
    }
    catch (error) {
        console.error("Error procesando pago exitoso:", error);
        res.status(500).json({
            success: false,
            message: "Error procesando el pago exitoso",
        });
    }
};
exports.success = success;
/**
 * Manejar pago fallido (callback de MercadoPago)
 */
const failure = async (req, res) => {
    try {
        const data = req.query;
        console.log("Pago fallido recibido:", data);
        const resultado = await Pago_service_1.MercadoPagoService.procesarPagoFallido(data.payment_id, data.external_reference ?? "");
        res.status(200).json({
            success: false,
            message: "Pago rechazado",
            data,
        });
    }
    catch (error) {
        console.error("Error procesando pago fallido:", error);
        res.status(500).json({
            success: false,
            message: "Error procesando el pago fallido",
        });
    }
};
exports.failure = failure;
/**
 * Manejar pago pendiente (callback de MercadoPago)
 */
const pending = async (req, res) => {
    try {
        const data = req.query;
        console.log("Pago pendiente recibido:", data);
        const resultado = await Pago_service_1.MercadoPagoService.procesarPagoPendiente(data.payment_id, data.external_reference ?? "");
        res.status(200).json({
            success: true,
            message: "Pago pendiente",
            data,
        });
    }
    catch (error) {
        console.error("Error procesando pago pendiente:", error);
        res.status(500).json({
            success: false,
            message: "Error procesando el pago pendiente",
        });
    }
};
exports.pending = pending;
/**
 * Webhook para notificaciones de MercadoPago
 */
const webhook = async (req, res) => {
    try {
        const { type, data } = req.body;
        const resultado = await Pago_service_1.MercadoPagoService.procesarWebhook(type, data);
        res.status(200).json({
            received: true,
            processed: resultado,
        });
    }
    catch (error) {
        console.error("Error procesando webhook:", error);
        res.status(500).json({
            error: "Error procesando webhook",
            received: false,
        });
    }
};
exports.webhook = webhook;
/**
 * Obtener estado de pago de una venta
 */
const getPaymentStatus = async (req, res) => {
    try {
        const { ventaId } = req.params;
        const resultado = await Pago_service_1.MercadoPagoService.obtenerEstadoPago(ventaId);
        if (resultado.success) {
            res.status(200).json(resultado);
        }
        else {
            res.status(404).json(resultado);
        }
    }
    catch (error) {
        console.error("Error obteniendo estado de pago:", error);
        res.status(500).json({
            success: false,
            message: "Error obteniendo estado de pago",
        });
    }
};
exports.getPaymentStatus = getPaymentStatus;
/**
 * Completar venta manualmente (para efectivo o confirmación manual)
 */
const completeSale = async (req, res) => {
    try {
        const { ventaId } = req.params;
        const resultado = await venta_service_1.VentaService.completarVenta(ventaId);
        if (resultado.success) {
            res.status(200).json(resultado);
        }
        else {
            res.status(400).json(resultado);
        }
    }
    catch (error) {
        console.error("Error completando venta:", error);
        res.status(500).json({
            success: false,
            message: "Error completando venta",
        });
    }
};
exports.completeSale = completeSale;
/**
 * Cancelar venta
 */
const cancelSale = async (req, res) => {
    try {
        const { ventaId } = req.params;
        const resultado = await venta_service_1.VentaService.cancelarVenta(ventaId);
        if (resultado.success) {
            res.status(200).json(resultado);
        }
        else {
            res.status(400).json(resultado);
        }
    }
    catch (error) {
        console.error("Error cancelando venta:", error);
        res.status(500).json({
            success: false,
            message: "Error cancelando venta",
        });
    }
};
exports.cancelSale = cancelSale;
