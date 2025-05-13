import { Schema, model, Document } from "mongoose";

export interface IProducto extends Document {
  idProducto: string;
  nombre: string;
  cantidad: number;
  categoria: string;
  precio: number;
  estado: boolean;
  descuento: number;
  fechaCreacionProducto: Date;
  mostrarInformacion(): string;
  actualizarStock(cantidad: number): void;
}

const productoSchema = new Schema<IProducto>({
  idProducto: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
  categoria: { type: String, required: true },
  precio: { type: Number, required: true },
  estado: { type: Boolean, default: true },
  descuento: { type: Number, default: 0 },
  fechaCreacionProducto: { type: Date, default: Date.now },
});



// Método para mostrar información del producto
productoSchema.methods.mostrarInformacion = function (): string {
  return `Producto: ${this.nombre}, Precio: ${this.precio}, Stock: ${this.cantidad}`;
};

// Método para actualizar stock
productoSchema.methods.actualizarStock = function (cantidad: number): void {
  this.cantidad += cantidad;
};

export const ProductoModel = model<IProducto>("Producto", productoSchema);
