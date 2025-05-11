"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const persona_service_1 = require("../services/persona.service");
class AdminController {
    static async registroUsarioConRol(req, res) {
        const { rol } = req.body;
        const result = await persona_service_1.PersonaService.registerUsuario(req.body, rol);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error,
                errors: result.validationErrors,
            });
        }
        res.status(201).json({
            success: true,
            message: "Usuario registrado exitosamente",
            data: result.data,
        });
    }
}
exports.AdminController = AdminController;
