import mongoose, { Schema, Document } from 'mongoose';

interface IProductoVenta {
  idProducto: string;
  nombre: string;
  cantidadVendida: number;
  precioUnitario: number;
  descuento?: number;
  impuestos?: number;
  subtotal: number;
}

interface IMetodoPago {
  idMetodoPago: string;
  nombreMetodoPago: string;
  fechaEmisionResumen?: Date;
}

export interface IVenta extends Document {
  idVenta: string;
  fechaVenta: Date;
  productos: IProductoVenta[];
  metodoPago: IMetodoPago;
  total: number;
  vendedor: mongoose.Types.ObjectId;
}

const ProductoVentaSchema = new Schema<IProductoVenta>({
  idProducto: { type: String, required: true },
  nombre: { type: String, required: true },
  cantidadVendida: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true, min: 0 },
  descuento: { type: Number, default: 0, min: 0 },
  impuestos: { type: Number, default: 0, min: 0 },
  subtotal: { type: Number, required: true }
}, { _id: false });

const MetodoPagoSchema = new Schema<IMetodoPago>({
  idMetodoPago: { type: String, required: true },
  nombreMetodoPago: { type: String, required: true },
  fechaEmisionResumen: { type: Date }
}, { _id: false });

const VentaSchema = new Schema<IVenta>({
  idVenta: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `VNT-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  },
  fechaVenta: { type: Date, default: Date.now },
  productos: { type: [ProductoVentaSchema], required: true },
  metodoPago: { type: MetodoPagoSchema, required: true },
  total: { type: Number, required: true },
  vendedor: { 
    type: Schema.Types.ObjectId, 
    ref: 'Persona', 
    required: true 
  }
});

VentaSchema.pre<IVenta>('save', function(next) {
  this.productos.forEach(p => {
    p.subtotal = (p.precioUnitario * p.cantidadVendida) - (p.descuento || 0) + (p.impuestos || 0);
  });
  this.total = this.productos.reduce((sum, p) => sum + p.subtotal, 0);
  next();
});

export const VentaModel = mongoose.model<IVenta>('Venta', VentaSchema);