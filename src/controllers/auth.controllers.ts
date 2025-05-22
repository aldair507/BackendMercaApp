import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  public static async login(req: Request, res: Response): Promise<void> {
    const { correo, password } = req.body;

    const result = await AuthService.login(correo, password);

    if (result.success && result.token) {
      res.cookie("sessionToken", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    res.status(result.statusCode).json({
      success: result.success,
      data: result.data,
      token: result.token,
      error: result.error,
    });
    // No return aquí
  }

  public static async logout(req: Request, res: Response) {
    const result = await AuthService.logout(res);

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      error: result.error,
    });
  }
}
