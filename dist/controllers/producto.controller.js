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
                res.status(400).json(resultado);
                return;
            }
            res.status(201).json(resultado);
        }
        catch (error) {
            console.error("Error en controlador de producto:", error);
            res.status(500).json({
                success: false,
                error: "Error interno del servidor",
            });
        }
    }
    static async actualizarProducto(req, res, next) {
        try {
            const idProducto = req.params.id;
            console.log(idProducto);
            if (!idProducto) {
                res.status(400).json({
                    success: false,
                    error: "El ID del producto es requerido",
                });
                return;
            }
            const resultado = await producto_service_1.ProductoService.actualizarProducto(idProducto, req.body);
            if (resultado.success) {
                res.status(200).json(resultado);
            }
            else {
                if (resultado.error === "Producto no encontrado") {
                    res.status(404).json(resultado);
                }
                else {
                    res.status(400).json(resultado);
                }
            }
        }
        catch (error) {
            next(error);
        }
    }
    static async aumentarStockController(req, res) {
        const { idProducto, cantidadAumentar } = req.body;
        const inventario = new inventario_service_1.Inventario();
        if (!idProducto || typeof cantidadAumentar !== "number") {
            res.status(400).json({
                success: false,
                message: "Debes enviar 'idProducto' y 'cantidadAumentar' como número",
            });
            return;
        }
        try {
            const productoActualizado = await inventario.aumentarStock(idProducto, cantidadAumentar);
            res.status(200).json({
                success: true,
                mensaje: `Stock aumentado correctamente para ${productoActualizado.nombre}`,
                data: productoActualizado,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                mensaje: error instanceof Error ? error.message : "Error al aumentar stock",
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
