"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacionModel = void 0;
const mongoose_1 = require("mongoose");
const NotificacionSchema = new mongoose_1.Schema({
    idNotificacion: {
        type: String,
        required: true,
        unique: true,
        default: () => `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    usuarioDestino: {
        type: String,
        required: true,
        ref: 'Persona'
    },
    tipoNotificacion: {
        type: String,
        enum: ['solicitud_cambio_rol', 'respuesta_solicitud', 'general'],
        required: true
    },
    titulo: {
        type: String,
        required: true,
        maxlength: 100
    },
    mensaje: {
        type: String,
        required: true,
        maxlength: 500
    },
    leida: {
        type: Boolean,
        default: false
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    fechaLeida: Date,
    datosAdicionales: mongoose_1.Schema.Types.Mixed,
    referenciaDocumento: String
}, {
    timestamps: true
});
exports.NotificacionModel = (0, mongoose_1.model)('Notificacion', NotificacionSchema);
