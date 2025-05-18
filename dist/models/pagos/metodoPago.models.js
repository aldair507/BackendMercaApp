"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetodoPagoModel = void 0;
const mongoose_1 = require("mongoose");
const MetodoPagoSchema = new mongoose_1.Schema({
    idMetodoPago: {
        type: String,
        required: true,
        unique: true,
    },
    nombreMetodoPago: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
    },
}, {
    versionKey: false,
    timestamps: true,
});
exports.MetodoPagoModel = (0, mongoose_1.model)("MetodoPago", MetodoPagoSchema);
