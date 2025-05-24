import { Document } from "mongoose";

export interface IProducto extends Document {
  idProducto: string;
  nombre: string;
  cantidad: number;
  categoria: string;
  precio: number;
  estado: boolean;
  descuento: number;
  impuestos: number;
  fechaCreacionProducto: Date;
}

// Opcional para creación sin campos auto generados
export interface IProductoCreate {
  idProducto: string;
  nombre: string;
  cantidad: number;
  categoria: string;
  precio: number;
  estado?: boolean;
  descuento?: number;
  impuestos?: number;
  fechaCreacionProducto?: Date;
}
