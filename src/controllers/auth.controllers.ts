import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  public static async login(req: Request, res: Response) {
    const { correo, password } = req.body;

    const result = await AuthService.login(correo, password, res);

    res.status(result.statusCode).json({
      success: result.success,
      data: result.data,
      error: result.error,
    });
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
