"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoVentaSchema = void 0;
const mongoose_1 = require("mongoose");
exports.ProductoVentaSchema = new mongoose_1.Schema({
    idProducto: { type: String, required: true },
    cantidadVendida: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true, min: 0 },
    descuento: { type: Number, default: 0, min: 0 },
    impuestos: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true },
}, { _id: false });
