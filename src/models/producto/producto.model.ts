import { Schema, model, Document } from "mongoose";

export interface IProducto extends Document {
  idProducto: string; // Cambiado a no opcional
  nombre: string;
  cantidad: number;
  categoria: string;
  precio: number;
  estado: boolean;
  descuento: number;
  fechaCreacionProducto: Date;
}

const ProductoSchema = new Schema<IProducto>({
  idProducto: {
    type: String,
    required: [true, 'El ID del producto es obligatorio'],
    unique: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true
  },
  cantidad: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: [0, 'La cantidad no puede ser negativa']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: ['Frutas',
      'Verduras',
      'Carnes',
      'Lácteos',
      'Bebidas',
      'Snacks',
      'Limpieza',
      'Otros']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0.01, 'El precio debe ser mayor que cero']
  },
  estado: {
    type: Boolean,
    default: true
  },
  descuento: {
    type: Number,
    default: 0,
    min: [0, 'El descuento no puede ser negativo']
  },
  fechaCreacionProducto: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

export const ProductoModel = model<IProducto>("Producto", ProductoSchema);