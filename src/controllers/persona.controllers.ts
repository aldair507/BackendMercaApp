import { PersonaService } from "../services/persona.service";
import { Request, Response, RequestHandler } from "express";

export class UsuarioController {
  static registerUsuario: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const result = await PersonaService.registerUsuario(req.body);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.error,
          errors: result.validationErrors,
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: result.data,
      });
    } catch (error) {
      console.error("Error en registerUsuario:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };

  public static async actualizarUsuario(
    req: Request & { user?: any },
    res: Response
  ) {
    try {
      const id = req.params.id;
      const datos = { ...req.body };
      const usuarioAuth = req.user;

      if ("password" in datos) {
        delete datos.password;
      }

      const permitirCambioDeRol = usuarioAuth?.rol === "administrador";

      const resultado = await PersonaService.actualizarDatosUsuario(
        id,
        datos,
        permitirCambioDeRol
      );

      if (!resultado.success) {
        return res.status(resultado.code || 400).json({
          success: false,
          message: resultado.error,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Usuario actualizado exitosamente",
        data: resultado.data,
      });
    } catch (error) {
      console.error("Error en actualizarUsuario:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  public static async obtenerUsuario(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await PersonaService.obtenerUsuarioPorId(id);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Error en obtenerUsuario:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}
