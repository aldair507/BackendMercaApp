import mongoose, { Schema, Document, model } from "mongoose";
import { object } from "zod";

interface IProductoVenta {
  idProducto: string;
  cantidadVendida: number;
  precioUnitario: number;
  descuento?: number;
  impuestos?: number;
  subtotal: number;
}

export interface IVenta extends Document {
  idVenta: string;
  fechaVenta: Date;
  productos: IProductoVenta[];
  IdMetodoPago: string; // solo el id aquí
  total: number;
  vendedor: string;

  //  vendedor: mongoose.Types.ObjectId;
}

const ProductoVentaSchema = new Schema<IProductoVenta>(
  {
    idProducto: { type: String, required: true },
    cantidadVendida: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true, min: 0 },
    descuento: { type: Number, default: 0, min: 0 },
    impuestos: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const VentaSchema = new Schema<IVenta>({
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
    type: String,
    ref: "Usuarios", // Updated to match the actual model name in PersonaModel
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

VentaSchema.pre<IVenta>("save", function (next) {
  this.productos.forEach((p) => {
    p.subtotal =
      p.precioUnitario * p.cantidadVendida -
      (p.descuento || 0) +
      (p.impuestos || 0);
  });
  this.total = this.productos.reduce((sum, p) => sum + p.subtotal, 0);
  next();
});

export const VentaModel = mongoose.model<IVenta>("Venta", VentaSchema);
