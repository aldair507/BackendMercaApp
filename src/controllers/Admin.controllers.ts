import { PersonaService } from "../services/persona.service";
import { Request, Response } from "express";

export class AdminController {
  public static async registroUsuarioConRol(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requestData = req.body;
      const { rol } = req.body;

      const rolesPermitidos = [
        "administrador",
        "usuario",
        "vendedor",
        "microempresario",
      ];
      if (rol && !rolesPermitidos.includes(rol)) {
        res.status(400).json({
          success: false,
          message: "Rol no válido",
          requestData: requestData,
        }); // OK para salir y no continuar
      }

      const result = await PersonaService.registerUsuario(requestData, rol);

      // Aquí NO debes retornar nada, solo enviar respuesta
      res.status(201).json({
        success: true,
        message: `Usuario registrado exitosamente con rol: ${rol}`,
        data: result.data,
        requestData: requestData,
      });
      // No return aquí
    } catch (error) {
      console.error("Error en registroUsuarioConRol:", error);

      // Tampoco retornes aquí
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        requestData: req.body,
      });
    }
  }
}
