import { Document, Types } from "mongoose";

// Tu interfaz original extendida para MercadoPago
export interface IVenta extends Document {
  idVenta: string;
  fechaVenta: Date;
  productos: Array<{
    idProducto: string;
    nombre?: string;
    categoria?: string;
    cantidadVendida: number;
    precioUnitario?: number;
    descuento?: number;
    impuestos?: number;
    subtotal?: number;
  }>;
  IdMetodoPago: string;
  total: number;
  vendedor: Types.ObjectId;
  
  // Campos adicionales para MercadoPago
  paymentId?: string;
  externalReference?: string;
  estadoPago?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  compradorInfo?: {
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    direccion?: string;
  };
}