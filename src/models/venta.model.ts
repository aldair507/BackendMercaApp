import { IVenta } from "../interfaces/venta.interface";

import mongoose, { Schema } from "mongoose";
import { ProductoVentaSchema } from "../models/productoVenta";

export const VentaSchema = new Schema<IVenta>({
  idVenta: {
    type: String,
    unique: true,
    required: true,
  },
  fechaVenta: { type: Date, default: Date.now },
  productos: { type: [ProductoVentaSchema], required: true },
  IdMetodoPago: { type: String, required: true },
  total: { type: Number, required: true },
  vendedor: {
    type: Schema.Types.ObjectId,
    ref: "Usuarios",
    required: true,
  },
});

VentaSchema.pre("validate", function (next) {
  if (!this.idVenta) {
    // aquí 'this' es any, por eso hay que castear para TS
    this.idVenta = (this._id as mongoose.Types.ObjectId).toString();
  }
  next();
});


export const VentaModel = mongoose.model<IVenta>("Venta", VentaSchema);
