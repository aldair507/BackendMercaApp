import { IPersona } from "./persona.interface";
import mongoose from "mongoose";
export interface IVendedor extends IPersona {
  codigoVendedor: string;
  ventasRealizadas: mongoose.Types.ObjectId[];
}