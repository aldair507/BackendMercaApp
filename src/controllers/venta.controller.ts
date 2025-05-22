// controllers/venta.controller.ts
import { Request, Response } from "express";
import { VentaService } from "../services/venta.service";
import { ComprobanteService } from "../services/comprobante.service";
export class VentaController {
  static async registrarVenta(
    req: Request & { user?: { id?: string } },
    res: Response
  ): Promise<void> {
    try {
      // Validar que el usuario esté autenticado y tenga un ID
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado o sin ID válido",
        });
        return;
      }

      // Registrar la venta con el ID del usuario autenticado como vendedor
      const resultadoVenta = await VentaService.registrarVenta(
        userId,
        req.body
      );

      if (resultadoVenta.success) {
        try {
          // Si la venta se registró correctamente, generar el comprobante
          const tipoComprobante = "factura"; // Por defecto se genera un ticket

          // Obtener el ID de la venta recién creada
          const ventaId = resultadoVenta.data?.idVenta;

          // Generar el comprobante de forma asíncrona sin esperar su finalización
          // para no retrasar la respuesta al cliente
          ComprobanteService.generarComprobante(
            resultadoVenta.data?.idVenta!,
            tipoComprobante
          )
            .then((resultadoComprobante) => {
              // Opcionalmente, podrías registrar en algún log el resultado
              if (!resultadoComprobante.success) {
                console.error(
                  `Error al generar comprobante para venta ${ventaId}:`,
                  resultadoComprobante.error
                );
              }
            })
            .catch((error) => {
              console.error(
                `Error inesperado al generar comprobante para venta ${ventaId}:`,
                error
              );
            });

          // Responder inmediatamente con la información de la venta
          res.status(201).json({
            ...resultadoVenta,
            mensaje: `${resultadoVenta.mensaje}. El comprobante se está generando y estará disponible en breve.`,
          });
        } catch (error) {
          // Si hay algún error con el comprobante, aún así devolvemos la venta como exitosa
          console.error("Error al intentar generar el comprobante:", error);
          res.status(201).json({
            ...resultadoVenta,
            mensaje: `${resultadoVenta.mensaje}. No se pudo generar el comprobante.`,
            errorComprobante:
              error instanceof Error
                ? error.message
                : "Error al generar comprobante",
          });
        }
      } else {
        res.status(400).json(resultadoVenta);
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
