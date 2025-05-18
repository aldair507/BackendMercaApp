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
    static async obtenerTodasLasVentasController(req, res) {
        const result = await venta_service_1.VentaService.obtenerTodasLasVentas();
        if (!result.success) {
            res.status(500).json({ success: false, message: result.error });
            return;
        }
        res.status(200).json(result);
    }
    static async obtenerVentasPorVendedorController(req, res) {
        const { idVendedor } = req.params;
        const result = await venta_service_1.VentaService.obtenerVentasPorVendedor(idVendedor);
        if (!result.success) {
            res.status(404).json({ success: false, message: result.error });
            return;
        }
        res.status(200).json(result);
    }
}
exports.VentaController = VentaController;
