// controllers/venta.controller.ts
import { Request, Response } from "express";
import { VentaService } from "../services/venta.service";
import { ComprobanteService } from "../services/comprobante.service";
import { VentaModel } from "../models/venta.model";
export class VentaController {
  static async recibirNotificacion(req: Request, res: Response) {
    try {
      const paymentId = req.query.id || req.body?.data?.id;
      const topic = req.query.topic || req.body?.type;

      console.log("📩 Webhook recibido:", { paymentId, topic });

      if (topic === "payment") {
        // Aquí iría la llamada real a Mercado Pago, simularemos:
        const estadoSimulado = "approved"; // Cambia esto por "rejected", etc.

        const ventaActualizada = await VentaModel.findOneAndUpdate(
          { paymentId },
          { estadoPago: estadoSimulado },
          { new: true }
        );

        console.log("✅ Venta actualizada:", ventaActualizada);
        return res
          .status(200)
          .json({ success: true, message: "Pago procesado." });
      }

      res
        .status(400)
        .json({ success: false, message: "Notificación no válida." });
    } catch (error) {
      console.error("❌ Error en webhook:", error);
      res
        .status(500)
        .json({ success: false, message: "Error interno del servidor." });
    }
  }
  static async registrarVenta(
    req: Request & { user?: { id?: string } },
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado o sin ID válido",
        });
        return;
      }

      const resultadoVenta = await VentaService.registrarVenta(
        userId,
        req.body
      );

      if (resultadoVenta.success && resultadoVenta.data?.idVenta) {
        try {
          const tipoComprobante = "factura";
          const ventaId = resultadoVenta.data.idVenta;
          console.log("ventaId recibido:", ventaId); // <-- Imprime esto antes del findOne

          // Usar async/await en lugar de promesas
          const resultadoComprobante =
            await ComprobanteService.generarComprobante(
              ventaId,
              tipoComprobante
            );

          if (!resultadoComprobante.success) {
            console.error(
              `Error al generar comprobante para venta ${ventaId}:`,
              resultadoComprobante.error
            );
          }

          res.status(201).json({
            ...resultadoVenta,
            mensaje: `Venta registrada exitosamente. ${
              resultadoComprobante.success
                ? "Comprobante generado correctamente."
                : "El comprobante no pudo generarse."
            }`,
            comprobanteGenerado: resultadoComprobante.success,
          });
        } catch (error) {
          console.error("Error al intentar generar el comprobante:", error);
          res.status(201).json({
            ...resultadoVenta,
            mensaje:
              "Venta registrada exitosamente. No se pudo generar el comprobante.",
            errorComprobante:
              error instanceof Error ? error.message : "Error desconocido",
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: resultadoVenta.error || "Error al registrar la venta",
          data: resultadoVenta.data,
        });
      }
    } catch (error) {
      console.error("Error en controlador de venta:", error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Error interno del servidor",
      });
    }
  }
  static async obtenerTodasLasVentasController(
    req: Request,
    res: Response
  ): Promise<void> {
    const result = await VentaService.obtenerTodasLasVentas();
    if (!result.success) {
      res.status(500).json({ success: false, message: result.error });
      return;
    }
    res.status(200).json(result);
  }

  static async obtenerVentasPorVendedorController(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idVendedor } = req.params;
    const result = await VentaService.obtenerVentasPorVendedor(idVendedor);
    if (!result.success) {
      res.status(404).json({ success: false, message: result.error });
      return;
    }
    res.status(200).json(result);
  }
}
