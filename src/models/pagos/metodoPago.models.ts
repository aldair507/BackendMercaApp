import {model,Schema} from 'mongoose'
export interface IMetodoPago extends Document {
  idMetodoPago: string;
  nombreMetodoPago: string;
  descripcion?: string;
}

const MetodoPagoSchema = new Schema<IMetodoPago>(
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