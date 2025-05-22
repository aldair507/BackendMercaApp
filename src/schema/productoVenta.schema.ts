import { IProductoVenta } from "../interfaces/productoVenta.interface";
import {Schema} from "mongoose";


export const ProductoVentaSchema = new Schema<IProductoVenta>(
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