"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentaController = void 0;
const venta_service_1 = require("../services/venta.service");
class VentaController {
    static async registrarVenta(req, res) {
        try {
            // Validar que el usuario esté autenticado y tenga un ID
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado o sin ID válido",
                });
                return;
            }
            // Registrar la venta con el ID del usuario autenticado como vendedor
            const resultado = await venta_service_1.VentaService.registrarVenta(userId, req.body);
            console.log(req.body);
            if (resultado.success) {
                res.status(201).json(resultado);
            }
            else {
                res.status(400).json(resultado);
            }
        }
        catch (error) {
            console.error("Error en controlador de venta:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno del servidor",
            });
        }
    }
}
exports.VentaController = VentaController;
