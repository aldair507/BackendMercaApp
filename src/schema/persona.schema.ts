import { IPersona } from "../interfaces/persona.interface";
import mongoose, { Schema, Document } from "mongoose";

export interface IPersonaDocument extends IPersona, Document {}

export const personaSchema = new Schema<IPersonaDocument>(
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
    nit: { type: String }, // Campo opcional para microempresarios
    nombreEmpresa: { type: String }, // Campo opcional para microempresarios
    codigoVendedor: { type: String }, // Campo opcional para vendedores
    ventasRealizadas: [{ type: Schema.Types.ObjectId, ref: "Venta" }],
  },
  {
    timestamps: true,
  }
);
