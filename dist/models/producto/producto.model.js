"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoModel = void 0;
const mongoose_1 = require("mongoose");
const ProductoSchema = new mongoose_1.Schema({
    idProducto: {
        type: String,
        required: [true, 'El ID del producto es obligatorio'],
        unique: true
    },
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true
    },
    cantidad: {
        type: Number,
        required: [true, 'La cantidad es obligatoria'],
        min: [0, 'La cantidad no puede ser negativa']
    },
    categoria: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        enum: ['ELECTRONICA', 'ROPA', 'ALIMENTOS', 'HOGAR', 'OTROS']
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0.01, 'El precio debe ser mayor que cero']
    },
    estado: {
        type: Boolean,
        default: true
    },
    descuento: {
        type: Number,
        default: 0,
        min: [0, 'El descuento no puede ser negativo']
    },
    fechaCreacionProducto: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});
exports.ProductoModel = (0, mongoose_1.model)("Producto", ProductoSchema);
