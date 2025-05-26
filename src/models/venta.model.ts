import mongoose, { Schema } from "mongoose";
import { IVenta } from "../interfaces/venta.interface";

const ventaSchema = new Schema<IVenta>({
  idVenta: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  fechaVenta: {
    type: Date,
    default: Date.now
  },
  productos: [{
    idProducto: { type: String, required: true },
    nombre: { type: String },
    categoria: { type: String },
    cantidadVendida: { type: Number, required: true },
    precioUnitario: { type: Number },
    descuento: { type: Number, default: 0 },
    impuestos: { type: Number, default: 0 },
    subtotal: { type: Number }
  }],
  IdMetodoPago: {
    type: String,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  vendedor: {
    type: Schema.Types.ObjectId,
    required: true
  },
  
  // Campos adicionales para MercadoPago
  paymentId: {
    type: String,
    index: true // Permite múltiples documentos con valor null
  },
  externalReference: {
    type: String,
    sparse: true
  },
  estadoPago: {
    type: String,
    enum: ['pendiente', 'pagado', 'rechazado', 'cancelado'],
    default: 'pendiente'
  },
  compradorInfo: {
    email: { type: String },
    nombre: { type: String },
    apellido: { type: String },
    telefono: { type: String },
    direccion: { type: String }
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
// ventaSchema.index({ vendedor: 1 });
// ventaSchema.index({ estadoPago: 1 });
// ventaSchema.index({ paymentId: 1 });
// ventaSchema.index({ externalReference: 1 });

export const VentaModel = mongoose.model<IVenta>("Venta", ventaSchema);