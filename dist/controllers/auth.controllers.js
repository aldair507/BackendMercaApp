"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async login(req, res) {
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
            const result = await auth_service_1.AuthService.login(correo, password, res);
            return res.status(result.statusCode).json({
                success: result.success,
                data: result.data,
                error: result.error,
            });
        }
        catch (error) {
            console.error("Error en AuthController.login:", error);
            return res.status(500).json({
                success: false,
                error: "Error interno del servidor",
            });
        }
    }
    static async logout(req, res) {
        try {
            const result = await auth_service_1.AuthService.logout(res);
            return res.status(result.statusCode).json({
                success: result.success,
                message: result.message,
                error: result.error,
            });
        }
        catch (error) {
            console.error("Error en AuthController.logout:", error);
            return res.status(500).json({
                success: false,
                error: "Error al cerrar sesión",
            });
        }
    }
}
exports.AuthController = AuthController;
