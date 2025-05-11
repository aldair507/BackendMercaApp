"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const persona_model_1 = require("../models/persona/persona.model");
const generateToken_1 = require("../middlewares/generateToken");
const auth_utils_1 = require("../utils/auth.utils");
class AuthService {
    static async login(correo, password, res) {
        try {
            // 1. Buscar usuario por correo incluyendo explícitamente el password
            const usuario = await persona_model_1.PersonaModel.findOne({ correo });
            if (!usuario) {
                return {
                    success: false,
                    statusCode: 401,
                    error: "Usuario no encontrado",
                };
            }
            // 3. Comparar contraseñas de forma segura
            const isMatch = await (0, auth_utils_1.comparePasswords)(password, usuario.password);
            if (!isMatch) {
                return {
                    success: false,
                    statusCode: 401,
                    error: "Credenciales inválidas",
                };
            }
            const token = (0, generateToken_1.generateToken)(usuario.idPersona.toString(), usuario.rol);
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
        }
        catch (error) {
            console.error("Error detallado en AuthService.login:", error);
            return {
                success: false,
                statusCode: 500,
                error: process.env.NODE_ENV === "development"
                    ? `Error interno`
                    : "Error interno del servidor",
            };
        }
    }
    static async logout(res) {
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
        }
        catch (error) {
            console.error("Error en AuthService.logout:", error);
            return {
                success: false,
                statusCode: 500,
                error: "Error al cerrar sesión",
            };
        }
    }
}
exports.AuthService = AuthService;
