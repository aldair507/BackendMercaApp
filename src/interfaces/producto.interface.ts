// src/interfaces/producto.interface.ts
import { Document } from "mongoose";

export interface IProducto extends Document {
  idProducto?: string;
  nombre: string;
  cantidad: number;
  categoria: string;
  precio: number;
  estado?: boolean; // Hacer opcional ya que tiene valor por defecto
  descuento?: number;
  fechaCreacionProducto?: Date; // Hacer opcional ya que se asigna automáticamente
}

// Interfaz para creación de productos
export interface IProductoCreate {
  idProducto: string; // Cambiado a no opcional
  nombre: string;
  cantidad: number;
  categoria: string;
  precio: number;
  estado?: boolean;
  descuento?: number;
 fechaCreacionProducto?: Date;
}
