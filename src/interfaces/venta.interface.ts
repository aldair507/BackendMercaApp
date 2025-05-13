import { IPersona } from "./persona.interface";

// En tu interfaz IVenta
export interface IVenta extends Document {
  idVenta: string;
  fechaVenta: Date;
  vendedor:IPersona
  productos: Array<{
    idProducto: string;
    nombre: string;
    cantidadVendida: number;
    precioUnitario: number;
    descuento?: number;
    impuestos?: number;
    subtotal: number;
  }>;
  metodoPago: {
    idMetodoPago: string;
    nombreMetodoPago: string;
    fechaEmisionResumen: Date;
  };
  total: number;
}