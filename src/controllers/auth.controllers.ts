import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  public static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { correo, password } = req.body;

      // Validación mínima
      if (!correo || !password) {
        return res.status(400).json({
          success: false,
          error: 'Correo y contraseña son obligatorios',
        });
      }

      // Lógica delegada al servicio
      const result = await AuthService.login(correo, password, res);

      return res.status(result.statusCode).json({
        success: result.success,
        data: result.data,
        error: result.error,
      });
    } catch (error) {
      console.error("Error en AuthController.login:", error);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }

  public static async logout(req: Request, res: Response): Promise<Response> {
    try {
      const result = await AuthService.logout(res);

      return res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        error: result.error,
      });
    } catch (error) {
      console.error("Error en AuthController.logout:", error);
      return res.status(500).json({
        success: false,
        error: "Error al cerrar sesión",
      });
    }
  }
}
