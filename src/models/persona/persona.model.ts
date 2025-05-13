import { Schema, model, Document } from "mongoose";
import { IPersona } from "../../interfaces/persona.interface";
import z from "zod"

export interface IPersonaDocument extends IPersona, Document {}

const personaSchema = new Schema<IPersonaDocument>(
  {
    idPersona: { type: Schema.Types.ObjectId, auto: true },
    rol: { type: String, required: true },
    estadoPersona: { type: Boolean, required: true },
    nombrePersona: { type: String, required: true },
    apellido: { type: String, required: true },
    edad: { type: Number, required: true },
    identificacion: { type: Number, required: true },
    correo: { type: String, required: true },
    password: { type: String, required: true },
    fechaCreacionPersona: { type: Date, default: Date.now },
    nit: { type: String }, // Campo opcional para microempresarios
    nombreEmpresa: { type: String }, // Campo opcional para microempresarios
    codigoVendedor: { type: String }, // Campo opcional para vendedores
  },
  {
    timestamps: true,
  }
);


export const PersonaModel = model<IPersonaDocument>("Usuarios", personaSchema);