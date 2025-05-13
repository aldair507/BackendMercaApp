"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoModel = void 0;
const mongoose_1 = require("mongoose");
const productoSchema = new mongoose_1.Schema({
    idProducto: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true },
    categoria: { type: String, required: true },
    precio: { type: Number, required: true },
    estado: { type: Boolean, default: true },
    descuento: { type: Number, default: 0 },
    fechaCreacionProducto: { type: Date, default: Date.now },
});
// Método para mostrar información del producto
productoSchema.methods.mostrarInformacion = function () {
    return `Producto: ${this.nombre}, Precio: ${this.precio}, Stock: ${this.cantidad}`;
};
// Método para actualizar stock
productoSchema.methods.actualizarStock = function (cantidad) {
    this.cantidad += cantidad;
};
exports.ProductoModel = (0, mongoose_1.model)("Producto", productoSchema);
