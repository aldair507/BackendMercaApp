"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoController = void 0;
const producto_service_1 = require("../services/producto.service");
const inventario_service_1 = require("../services/inventario.service");
class ProductoController {
    static async registrarProducto(req, res) {
        try {
            const resultado = await producto_service_1.ProductoService.registrarProducto(req.body);
            if (!resultado.success) {
                return res.status(400).json(resultado);
            }
            return res.status(201).json(resultado);
        }
        catch (error) {
            console.error("Error en controlador de producto:", error);
            return res.status(500).json({
                success: false,
                error: "Error interno del servidor",
            });
        }
    }
    static async listar(req, res) {
        const inventario = new inventario_service_1.Inventario();
        try {
            const resultado = await inventario.listarProductosPorCategoria();
            res.json({ success: true, data: resultado });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: "Error al listar productos por categoría",
            });
        }
    }
}
exports.ProductoController = ProductoController;
