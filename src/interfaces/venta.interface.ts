import { Document, Types } from "mongoose";
import { IProductoVenta } from "./productoVenta.interface";

export interface IVenta extends Document {
  idVenta: string;
  fechaVenta: Date;
  productos: IProductoVenta[];
  IdMetodoPago: string;
  total: number;
  vendedor: Types.ObjectId;
}
