"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoVentaSchema = exports.ProductoVenta = void 0;
const mongoose_1 = require("mongoose");
class ProductoVenta {
    constructor(idProducto, nombre, categoria, cantidadVendida, precioUnitario, descuento, impuestos, estrategia) {
        this.idProducto = idProducto;
        this.nombre = nombre;
        this.categoria = categoria;
        this.cantidadVendida = cantidadVendida;
        this.precioUnitario = precioUnitario;
        this.descuento = descuento;
        this.impuestos = impuestos;
        this.estrategia = estrategia;
    }
    calcularSubtotal() {
        return this.estrategia.calcularSubtotal(this.precioUnitario, this.cantidadVendida, this.descuento, this.impuestos);
    }
}
exports.ProductoVenta = ProductoVenta;
exports.ProductoVentaSchema = new mongoose_1.Schema({
    idProducto: { type: String, required: true },
    cantidadVendida: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true, min: 0 },
    descuento: { type: Number, default: 0, min: 0 },
    impuestos: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true },
}, { _id: false });
