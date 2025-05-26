"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioController = void 0;
const persona_service_1 = require("../services/persona.service");
const cambioContrase_a_types_1 = require("../types/cambioContrase\u00F1a.types");
class UsuarioController {
    static async actualizarUsuario(req, res) {
        try {
            const id = req.params.id;
            console.log(id);
            const datos = { ...req.body };
            const usuarioAuth = req.user;
            if ("password" in datos) {
                delete datos.password;
            }
            const permitirCambioDeRol = usuarioAuth?.rol === "administrador";
            const resultado = await persona_service_1.PersonaService.actualizarDatosUsuario(id, datos, permitirCambioDeRol);
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
        }
        catch (error) {
            console.error("Error en actualizarUsuario:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
    static async cambiarContrasena(req, res) {
        try {
            const { id } = req.params;
            console.log(id);
            const datosValidados = cambioContrase_a_types_1.CambioContrasenaSchema.parse(req.body);
            const resultado = await persona_service_1.PersonaService.cambiarContrasena(id, datosValidados);
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
        }
        catch (error) {
            console.error("Error en PersonaController.cambiarContrasena:", error);
            res.status(500).json({
                success: false,
                error: "Error interno del servidor",
            });
        }
    }
    static async obtenerUsuario(req, res) {
        try {
            const id = req.params.id;
            const result = await persona_service_1.PersonaService.obtenerUsuarioPorId(id);
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
        }
        catch (error) {
            console.error("Error en obtenerUsuario:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
            });
        }
    }
    static async getUsuarios(req, res) {
        try {
            const resultado = await persona_service_1.PersonaService.getUsuarios();
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
        }
        catch (error) {
            console.error("Error en getUsuarios:", error);
            res.status(500).json({
                success: false,
                message: "Error al obtener usuarios",
            });
        }
    }
}
exports.UsuarioController = UsuarioController;
_a = UsuarioController;
UsuarioController.registerUsuario = async (req, res) => {
    try {
        const userData = req.body;
        const result = await persona_service_1.PersonaService.registerUsuario(userData);
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
    }
    catch (error) {
        console.error("Error en registerUsuario:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            requestData: req.body,
        });
    }
};
