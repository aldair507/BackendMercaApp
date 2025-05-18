"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventario = void 0;
const producto_model_1 = require("../models/producto/producto.model");
class Inventario {
    // 1. Listar todos los productos
    async listarProductos() {
        return await producto_model_1.ProductoModel.find({ estado: true });
    }
    // 2. Listar productos agrupados por categoría
    async listarProductosPorCategoria() {
        const productos = await producto_model_1.ProductoModel.find({ estado: true });
        const categoriasMap = new Map();
        for (const p of productos) {
            const productoFormateado = {
                idProducto: p.idProducto,
                nombre: p.nombre,
                cantidad: p.cantidad,
                precio: p.precio,
                descuento: p.descuento,
            };
            if (!categoriasMap.has(p.categoria)) {
                categoriasMap.set(p.categoria, {
                    nombreCategoria: p.categoria,
                    productos: [productoFormateado],
                });
            }
            else {
                categoriasMap.get(p.categoria)?.productos.push(productoFormateado);
            }
        }
        return {
            categorias: Array.from(categoriasMap.values()),
        };
    }
    // 3. Buscar productos por nombre, ID o categoría
    async buscarProductos(criterio) {
        return await producto_model_1.ProductoModel.find({
            estado: true,
            $or: [
                { nombre: { $regex: criterio, $options: "i" } },
                { idProducto: { $regex: criterio, $options: "i" } },
                { categoria: { $regex: criterio, $options: "i" } },
            ],
        });
    }
    // 4. Guardar nuevo producto
    async guardarProducto(productoData) {
        const producto = new producto_model_1.ProductoModel(productoData);
        return await producto.save();
    }
    async aumentarStock(idProducto, cantidadAumentar) {
        const producto = await producto_model_1.ProductoModel.findOne({ idProducto });
        if (!producto)
            throw new Error("Producto no encontrado");
        if (!producto.estado)
            throw new Error("Producto inactivo");
        producto.cantidad += cantidadAumentar;
        await producto.save();
        return producto;
    }
    // 5. Actualizar stock del producto (por ejemplo, después de una venta)
    async actualizarStock(idProducto, cantidadVendida) {
        const producto = await producto_model_1.ProductoModel.findOne({ idProducto });
        if (!producto)
            throw new Error("Producto no encontrado");
        if (producto.cantidad < cantidadVendida) {
            throw new Error(`Stock insuficiente para ${producto.nombre}`);
        }
        producto.cantidad -= cantidadVendida;
        await producto.save();
        return producto;
    }
    // 6. Desactivar producto (soft delete)
    async desactivarProducto(idProducto) {
        return await producto_model_1.ProductoModel.findOneAndUpdate({ idProducto }, { estado: false }, { new: true });
    }
    // 7. Calcular el valor total del inventario
    async calcularValorTotalInventario() {
        const productos = await producto_model_1.ProductoModel.find({ estado: true });
        return productos.reduce((total, prod) => total + prod.precio * prod.cantidad, 0);
    }
}
exports.Inventario = Inventario;
