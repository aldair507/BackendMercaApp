import { PersonaService } from "../services/persona.service";
import { Request, Response, RequestHandler } from "express";

import { CambioContrasenaSchema } from "../types/cambioContraseña.types";

export class UsuarioController {
  static registerUsuario: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const userData = req.body;
      const result = await PersonaService.registerUsuario(userData);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.error,
          errors: result.validationErrors,
          requestData: userData,
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
        requestData: req.body,
      });
    }
  };

  public static async actualizarUsuario(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    try {
      const id = req.params.id;
      console.log(id);
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
        res.status(resultado.code || 400).json({
          success: false,
          message: resultado.error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Usuario actualizado exitosamente",
        data: resultado.data,
      });
    } catch (error) {
      console.error("Error en actualizarUsuario:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  public static async cambiarContrasena(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      console.log(id);
      const datosValidados = CambioContrasenaSchema.parse(req.body);

      const resultado = await PersonaService.cambiarContrasena(
        id,
        datosValidados
      );

      if (!resultado.success) {
        res.status(resultado.code || 400).json({
          success: false,
          error: resultado.error,
          validationErrors: resultado.validationErrors,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: resultado.data,
        message: "Contraseña actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error en PersonaController.cambiarContrasena:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }

  public static async obtenerUsuario(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const id = req.params.id;
      const result = await PersonaService.obtenerUsuarioPorId(id);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Error en obtenerUsuario:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  public static async getUsuarios(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await PersonaService.getUsuarios();

      if (!resultado.success) {
        res.status(404).json({
          success: false,
          message: resultado.error || "No hay usuarios registrados",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: resultado.data,
        message: "Usuarios obtenidos exitosamente",
      });
    } catch (error) {
      console.error("Error en getUsuarios:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener usuarios",
      });
    }
  }
}
