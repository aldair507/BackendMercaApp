"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const persona_service_1 = require("../services/persona.service");
class AdminController {
    static async registroUsuarioConRol(req, res) {
        try {
            const requestData = req.body;
            const { rol } = req.body;
            const rolesPermitidos = [
                "administrador",
                "usuario",
                "vendedor",
                "microempresario",
            ];
            // Validar rol y retornar temprano si no es válido
            if (rol && !rolesPermitidos.includes(rol)) {
                res.status(400).json({
                    success: false,
                    message: "Rol no válido",
                    requestData
                });
                return; // Importante: retornar después de enviar respuesta
            }
            const result = await persona_service_1.PersonaService.registerUsuario(requestData, rol);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: result.error,
                    validationErrors: result.validationErrors,
                    requestData
                });
                return;
            }
            res.status(201).json({
                success: true,
                message: `Usuario registrado exitosamente con rol: ${rol}`,
                data: result.data,
                requestData
            });
        }
        catch (error) {
            console.error("Error en registroUsuarioConRol:", error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                requestData: req.body
            });
        }
    }
}
exports.AdminController = AdminController;
