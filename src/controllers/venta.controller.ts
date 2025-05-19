// controllers/venta.controller.ts
import { Request, Response } from "express";
import { VentaService } from "../services/venta.service";

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
      const resultado = await VentaService.registrarVenta(userId, req.body);

      console.log(req.body);
      if (resultado.success) {
        res.status(201).json(resultado);
      } else {
        res.status(400).json(resultado);
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
