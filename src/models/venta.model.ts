// Actualización para tu modelo existente - venta.model.ts
import { IVenta } from "../interfaces/venta.interface";
import mongoose, { Schema } from "mongoose";
import { ProductoVentaSchema } from "../models/productoVenta";

// Extensión de tu interfaz existente para MercadoPago
export interface IVentaExtendida extends IVenta {
  // Campos específicos para MercadoPago
  paymentId?: string;
  externalReference?: string;
  estadoPago?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  // Información del comprador (opcional)
  compradorInfo?: {
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    direccion?: string;
  };
}

export const VentaSchema = new Schema<IVentaExtendida>({
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
  // Nuevos campos para MercadoPago
  paymentId: {
    type: String,
    sparse: true // Permite null pero debe ser único si existe
  },
  externalReference: {
    type: String,
    sparse: true
  },
  estadoPago: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'approved' // Para ventas sin pasarela de pago
  },
  compradorInfo: {
    email: String,
    nombre: String,
    apellido: String,
    telefono: String,
    direccion: String
  }
});

VentaSchema.pre("validate", function (next) {
  if (!this.idVenta) {
    // aquí 'this' es any, por eso hay que castear para TS
    this.idVenta = (this._id as mongoose.Types.ObjectId).toString();
  }
  next();
});

// Índices para mejorar las consultas de MercadoPago
VentaSchema.index({ paymentId: 1 });
VentaSchema.index({ externalReference: 1 });
VentaSchema.index({ estadoPago: 1 });

export const VentaModel = mongoose.model<IVentaExtendida>("Venta", VentaSchema);