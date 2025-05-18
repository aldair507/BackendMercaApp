"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async login(req, res) {
        const { correo, password } = req.body;
        const result = await auth_service_1.AuthService.login(correo, password);
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
    static async logout(req, res) {
        const result = await auth_service_1.AuthService.logout(res);
        res.status(result.statusCode).json({
            success: result.success,
            message: result.message,
            error: result.error,
        });
    }
}
exports.AuthController = AuthController;
