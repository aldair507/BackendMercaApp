import { PersonaService } from "../services/persona.service";
import { Request, Response } from "express";

export class AdminController {
  public static async registroUsarioConRol(req: Request, res: Response) {
    const { rol } = req.body;

    const result = await PersonaService.registerUsuario(req.body, rol);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
        errors: result.validationErrors,
      });
    }
    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: result.data,
    });
  }
}
