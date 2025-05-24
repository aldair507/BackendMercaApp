import { Document } from "mongoose";

export interface IMetodoPago extends Document {
  idMetodoPago: string;
  nombreMetodoPago: string;
  descripcion?: string;
}
