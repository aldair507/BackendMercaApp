import { IPersona } from "./persona.interface";
import { Types } from "mongoose";

// En tu interfaz IVenta
export interface IVenta extends Document {
  idVenta: string;
  fechaVenta: Date;
  vendedor: Types.ObjectId | IPersona;
  productos: Array<{
    idProducto: string;
    nombre: string;
    cantidadVendida: number;
    precioUnitario: number;
    descuento?: number;
    impuestos?: number;
    subtotal: number;
  }>;

  idMetodoPago: string;

  total: number;
}
