import { PersonaModel } from "../models/persona/persona.model";
import { generateToken } from "../middlewares/generateToken";
import { comparePasswords } from "../utils/auth.utils";
import { Response } from "express";

export class AuthService {
  public static async login(correo: string, password: string, res: Response) {
    try {
      // 1. Buscar usuario por correo incluyendo explícitamente el password
      const usuario = await PersonaModel.findOne({ correo });

      if (!usuario) {
        return {
          success: false,
          statusCode: 401,
          error: "Usuario no encontrado",
        };
      }

      // 3. Comparar contraseñas de forma segura
      const isMatch = await comparePasswords(password, usuario.password);

      if (!isMatch) {
        return {
          success: false,
          statusCode: 401,
          error: "Credenciales inválidas",
        };
      }

      const token = generateToken(usuario.idPersona.toString(), usuario.rol);

      res.cookie("sessionToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      const userData = {
        idPersona: usuario.idPersona,
        nombrePersona: usuario.nombrePersona,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol,
        estadoPersona: usuario.estadoPersona,
      };

      return {
        success: true,
        statusCode: 200,
        data: userData,
      };
    } catch (error) {
      console.error("Error detallado en AuthService.login:", error);
      return {
        success: false,
        statusCode: 500,
        error:
          process.env.NODE_ENV === "development"
            ? `Error interno`
            : "Error interno del servidor",
      };
    }
  }

  public static async logout(res: Response) {
    try {
      // Limpiar la cookie de sesión
      res.clearCookie("sessionToken", {
        path: "/",
        domain: process.env.COOKIE_DOMAIN || undefined,
      });

      return {
        success: true,
        statusCode: 200,
        message: "Sesión cerrada exitosamente",
      };
    } catch (error) {
      console.error("Error en AuthService.logout:", error);
      return {
        success: false,
        statusCode: 500,
        error: "Error al cerrar sesión",
      };
    }
  }
}
