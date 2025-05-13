import { PersonaService } from "../services/persona.service";
import { Request, Response } from "express";

export class AdminController {
   public static async registroUsuarioConRol(req: Request, res: Response) {
    try {
      const requestData = req.body;
      const { rol } = req.body;
      
      // Validar que el rol existe
      const rolesPermitidos = ["administrador", "usuario", "vendedor", "microempresario"];
      if (rol && !rolesPermitidos.includes(rol)) {
        return res.status(400).json({
          success: false,
          message: "Rol no válido",
          requestData: requestData,
        });
      }
      
      // Registrar usuario con rol específico - enviamos todos los datos sin separar
      const result = await PersonaService.registerUsuario(requestData, rol);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
          errors: result.validationErrors,
          requestData: requestData,
        });
      }
      
      res.status(201).json({
        success: true,
        message: `Usuario registrado exitosamente con rol: ${rol}`,
        data: result.data,
        requestData: requestData,
      });
    } catch (error) {
      console.error("Error en registroUsuarioConRol:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        requestData: req.body,
      });
    }
  }
}
