import { model } from "mongoose";

import mongoose, { Schema } from "mongoose";
import { IPersonaDocument } from "../interfaces/persona.interface";

const PersonaSchema = new Schema<IPersonaDocument>(
  {
    idPersona: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    rol: { type: String, required: true },
    estadoPersona: { type: Boolean, required: true },
    nombrePersona: { type: String, required: true },
    apellido: { type: String, required: true },
    edad: { type: Number, required: true },
    identificacion: { type: Number, required: true },
    correo: { type: String, required: true },
    password: { type: String, required: true },
    fechaCreacionPersona: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const PersonaModel = model<IPersonaDocument>("Usuarios", PersonaSchema);
