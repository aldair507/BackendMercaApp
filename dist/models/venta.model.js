"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentaModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ventaSchema = new mongoose_1.Schema({
    idVenta: {
        type: String,
        required: true,
        unique: true,
        default: () => new mongoose_1.default.Types.ObjectId().toString()
    },
    fechaVenta: {
        type: Date,
        default: Date.now
    },
    productos: [{
            idProducto: { type: String, required: true },
            nombre: { type: String },
            categoria: { type: String },
            cantidadVendida: { type: Number, required: true },
            precioUnitario: { type: Number },
            descuento: { type: Number, default: 0 },
            impuestos: { type: Number, default: 0 },
            subtotal: { type: Number }
        }],
    IdMetodoPago: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    vendedor: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    // Campos adicionales para MercadoPago
    paymentId: {
        type: String,
        index: true // Permite múltiples documentos con valor null
    },
    externalReference: {
        type: String,
        sparse: true
    },
    estadoPago: {
        type: String,
        enum: ['pendiente', 'pagado', 'rechazado', 'cancelado'],
        default: 'pendiente'
    },
    compradorInfo: {
        email: { type: String },
        nombre: { type: String },
        apellido: { type: String },
        telefono: { type: String },
        direccion: { type: String }
    }
}, {
    timestamps: true
});
// Índices para optimizar consultas
// ventaSchema.index({ vendedor: 1 });
// ventaSchema.index({ estadoPago: 1 });
// ventaSchema.index({ paymentId: 1 });
// ventaSchema.index({ externalReference: 1 });
exports.VentaModel = mongoose_1.default.model("Venta", ventaSchema);
