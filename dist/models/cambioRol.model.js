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
exports.SolicitudCambioRolModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SolicitudCambioRolSchema = new mongoose_1.Schema({
    idSolicitud: {
        type: String,
        required: true,
        unique: true,
    },
    usuarioSolicitante: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuarios'
    },
    rolActual: {
        type: String,
        required: true,
        enum: ['usuario', 'vendedor', 'microempresario', 'administrador']
    },
    rolSolicitado: {
        type: String,
        required: true,
        enum: ['vendedor', 'microempresario']
    },
    motivoSolicitud: {
        type: String,
        required: true,
        maxlength: 500
    },
    estadoSolicitud: {
        type: String,
        enum: ['pendiente', 'aprobada', 'rechazada'],
        default: 'pendiente'
    },
    fechaSolicitud: {
        type: Date,
        default: Date.now
    },
    fechaRespuesta: Date,
    administradorQueResponde: String,
    comentarioAdmin: String,
    datosAdicionales: {
        nit: Number,
        nombreEmpresa: String,
        codigoVendedor: String,
        experienciaVentas: String
    }
}, {
    timestamps: true
});
exports.SolicitudCambioRolModel = (0, mongoose_1.model)('SolicitudCambioRol', SolicitudCambioRolSchema);
