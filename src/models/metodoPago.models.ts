import { model } from "mongoose";
import { IMetodoPago } from "../interfaces/metodoPago.interfaces";

import { Schema } from "mongoose";

export const MetodoPagoSchema = new Schema<IMetodoPago>(
  {
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
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const MetodoPagoModel = model<IMetodoPago>(
  "MetodoPago",
  MetodoPagoSchema
);
