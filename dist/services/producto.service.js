"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoService = void 0;
const producto_model_1 = require("../models/producto/producto.model");
class ProductoService {
    static async registrarProducto(data) {
        try {
            // Validación de campos obligatorios
            const camposObligatorios = ["idProducto", "nombre", "cantidad", "categoria", "precio"];
            const camposFaltantes = camposObligatorios.filter((campo) => !data[campo]);
            if (camposFaltantes.length > 0) {
                return {
                    success: false,
                    error: `Faltan campos obligatorios: ${camposFaltantes.join(", ")}`,
                };
            }
            // Conversión de tipos y sanitización
            const productoData = {
                idProducto: String(data.idProducto),
                nombre: String(data.nombre),
                cantidad: Number(data.cantidad),
                categoria: String(data.categoria),
                precio: Number(data.precio),
                descuento: data.descuento !== undefined ? Number(data.descuento) : undefined,
                estado: data.estado !== undefined ? Boolean(data.estado) : undefined,
            };
            // Validaciones de negocio
            if (productoData.cantidad < 0) {
                return {
                    success: false,
                    error: 'La cantidad no puede ser negativa',
                };
            }
            if (productoData.precio <= 0) {
                return {
                    success: false,
                    error: 'El precio debe ser mayor que cero',
                };
            }
            // Verificar si ya existe el ID del producto
            const productoExistente = await producto_model_1.ProductoModel.findOne({
                idProducto: productoData.idProducto,
            });
            if (productoExistente) {
                return {
                    success: false,
                    error: 'El ID del producto ya está registrado',
                };
            }
            // Guardar producto
            const nuevoProducto = new producto_model_1.ProductoModel(productoData);
            const productoGuardado = await nuevoProducto.save();
            return {
                success: true,
                data: {
                    idProducto: productoGuardado.idProducto,
                    nombre: productoGuardado.nombre,
                    cantidad: productoGuardado.cantidad,
                    categoria: productoGuardado.categoria,
                    precio: productoGuardado.precio,
                    descuento: productoGuardado.descuento,
                    estado: productoGuardado.estado,
                    fechaCreacionProducto: productoGuardado.fechaCreacionProducto,
                },
            };
        }
        catch (error) {
            console.error('Error registrando producto:', error);
            return {
                success: false,
                error: error.message || 'Error al registrar el producto',
            };
        }
    }
}
exports.ProductoService = ProductoService;
