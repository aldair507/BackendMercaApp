import { Request, Response } from "express";
import { VentaService } from "../services/venta.service";
import { MercadoPagoService } from "../services/Pago.service";
import { PaymentResponse } from "../interfaces/PaymentReponse";

/**
 * Crear venta (con integración automática de MercadoPago si no es efectivo)
 */
export const createSale = async (req: Request, res: Response) => {
  try {
    const {
      vendedorId,
      productos,
      compradorInfo,
      IdMetodoPago = "mercadopago",
      redirectUrls,
    } = req.body;

    // Validar datos requeridos
    if (!vendedorId || !productos) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos requeridos: vendedorId, productos",
      });
    }

    // Si no es efectivo, validar datos del comprador
    if (IdMetodoPago.toLowerCase() !== "efectivo" && !compradorInfo) {
      return res.status(400).json({
        success: false,
        message: "Los datos del comprador son requeridos para pagos electrónicos",
      });
    }

    // Registrar venta (incluye integración con MercadoPago si aplica)
    const resultado = await VentaService.registrarVenta(vendedorId, {
      productos,
      IdMetodoPago,
      compradorInfo,
      redirectUrls,
    });

    if (!resultado.success) {
      return res.status(400).json(resultado);
    }

    // Respuesta diferente según el método de pago
    const response: any = {
      success: true,
      data: {
        ventaId: resultado.data.idVenta,
        total: resultado.data.total,
        metodoPago: IdMetodoPago,
        estadoPago: resultado.data.estadoPago,
      },
      mensaje: resultado.mensaje,
    };

    // Si hay datos de MercadoPago, incluirlos en la respuesta
    if (resultado.mercadoPagoData) {
      response.data.mercadoPago = resultado.mercadoPagoData;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error("Error al crear venta:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * Manejar pago exitoso (callback de MercadoPago)
 */
export const success = async (req: Request, res: Response) => {
  try {
    const data = req.query as unknown as PaymentResponse;
    console.log("Pago exitoso recibido:", data);

    const resultado = await MercadoPagoService.procesarPagoExitoso(
      data.payment_id,
      data.external_reference ?? ""
    );

    res.status(200).json({
      success: resultado,
      message: resultado ? "Pago realizado exitosamente" : "Error procesando el pago",
      data,
    });
  } catch (error) {
    console.error("Error procesando pago exitoso:", error);
    res.status(500).json({
      success: false,
      message: "Error procesando el pago exitoso",
    });
  }
};

/**
 * Manejar pago fallido (callback de MercadoPago)
 */
export const failure = async (req: Request, res: Response) => {
  try {
    const data = req.query as unknown as PaymentResponse;
    console.log("Pago fallido recibido:", data);

    const resultado = await MercadoPagoService.procesarPagoFallido(
      data.payment_id,
      data.external_reference ?? ""
    );

    res.status(200).json({
      success: false,
      message: "Pago rechazado",
      data,
    });
  } catch (error) {
    console.error("Error procesando pago fallido:", error);
    res.status(500).json({
      success: false,
      message: "Error procesando el pago fallido",
    });
  }
};

/**
 * Manejar pago pendiente (callback de MercadoPago)
 */
export const pending = async (req: Request, res: Response) => {
  try {
    const data = req.query as unknown as PaymentResponse;
    console.log("Pago pendiente recibido:", data);

    const resultado = await MercadoPagoService.procesarPagoPendiente(
      data.payment_id,
      data.external_reference ?? ""
    );

    res.status(200).json({
      success: true,
      message: "Pago pendiente",
      data,
    });
  } catch (error) {
    console.error("Error procesando pago pendiente:", error);
    res.status(500).json({
      success: false,
      message: "Error procesando el pago pendiente",
    });
  }
};

/**
 * Webhook para notificaciones de MercadoPago
 */
export const webhook = async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    const resultado = await MercadoPagoService.procesarWebhook(type, data);

    res.status(200).json({ 
      received: true,
      processed: resultado 
    });
  } catch (error) {
    console.error("Error procesando webhook:", error);
    res.status(500).json({ 
      error: "Error procesando webhook",
      received: false 
    });
  }
};

/**
 * Obtener estado de pago de una venta
 */
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { ventaId } = req.params;

    const resultado = await MercadoPagoService.obtenerEstadoPago(ventaId);

    if (resultado.success) {
      res.status(200).json(resultado);
    } else {
      res.status(404).json(resultado);
    }
  } catch (error) {
    console.error("Error obteniendo estado de pago:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo estado de pago",
    });
  }
};

/**
 * Completar venta manualmente (para efectivo o confirmación manual)
 */
export const completeSale = async (req: Request, res: Response) => {
  try {
    const { ventaId } = req.params;

    const resultado = await VentaService.completarVenta(ventaId);

    if (resultado.success) {
      res.status(200).json(resultado);
    } else {
      res.status(400).json(resultado);
    }
  } catch (error) {
    console.error("Error completando venta:", error);
    res.status(500).json({
      success: false,
      message: "Error completando venta",
    });
  }
};

/**
 * Cancelar venta
 */
export const cancelSale = async (req: Request, res: Response) => {
  try {
    const { ventaId } = req.params;

    const resultado = await VentaService.cancelarVenta(ventaId);

    if (resultado.success) {
      res.status(200).json(resultado);
    } else {
      res.status(400).json(resultado);
    }
  } catch (error) {
    console.error("Error cancelando venta:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelando venta",
    });
  }
};