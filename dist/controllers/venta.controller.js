"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentaController = void 0;
const venta_service_1 = require("../services/venta.service");
class VentaController {
    static async registrarVenta(req, res) {
        try {
            // Obtener el ID del usuario autenticado del token JWT
            const userId = req.user.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado o sin ID válido"
                });
            }
            // Usar el ID del usuario autenticado como vendedor
            const resultado = await venta_service_1.VentaService.registrarVenta(userId, req.body);
            if (resultado.success) {
                return res.status(201).json(resultado);
            }
            else {
                return res.status(400).json(resultado);
            }
        }
        catch (error) {
            console.error("Error en controlador de venta:", error);
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error en el servidor"
            });
        }
    }
}
exports.VentaController = VentaController;
