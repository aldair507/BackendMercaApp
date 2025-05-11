"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaModel = void 0;
const mongoose_1 = require("mongoose");
const personaSchema = new mongoose_1.Schema({
    idPersona: { type: mongoose_1.Schema.Types.ObjectId, auto: true },
    rol: { type: String, required: true },
    estadoPersona: { type: Boolean, required: true },
    nombrePersona: { type: String, required: true },
    apellido: { type: String, required: true },
    edad: { type: Number, required: true },
    identificacion: { type: Number, required: true },
    correo: { type: String, required: true },
    password: { type: String, required: true },
    fechaCreacionPersona: { type: Date, default: Date.now },
}, {
    timestamps: true,
});
exports.PersonaModel = (0, mongoose_1.model)("Usuarios", personaSchema);
