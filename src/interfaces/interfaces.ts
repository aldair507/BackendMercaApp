import { Document, Schema, model } from 'mongoose';

// Interfaces basadas en el diagrama de clases
export interface IPersona extends Document {
  idPersona: string;
  rol: string;
  estadoPersona: boolean;
  nombrePersona: string;
  apellido: string;
  edad: number;
  identificacion: number;
  correo: string;
  fechaCreacionPersona: Date;
}

export interface IVendedor extends IPersona {
  codigoVendedor: string;
  ventasRealizadas: Array<string>; // IDs de ventas
}

export interface IProducto extends Document {
  idProducto: string;
  nombre: string;
  cantidad: number;
  categoria: string;
  precio: number;
  estado: boolean;
  descuento: number;
  fechaCreacionProducto: Date;
}

export interface IProductoVenta {
  idProducto: string;
  idVenta: string;
  cantidadVendida: number;
  precioUnitario: number;
  descuento: number;
  impuestos: number;
  subtotal: number;
}

export interface IMetodoPago {
  idMetodoPago: string;
  nombreMetodoPago: string;
  fechaEmisionResumen: Date;
}

export interface IVenta extends Document {
  idVenta: string;
  fechaVenta: Date;
  vendedor: IVendedor;
  productos: Array<IProductoVenta>;
  metodoPago: IMetodoPago;
  total: number;
}

export interface IComprobanteVenta extends Document {
  idComprobante: string;
  venta: Schema.Types.ObjectId | IVenta;
  fechaEmision: Date;
}

// Interfaces para la creación de objetos
export interface IProductoVentaCreate {
  idProducto: string;
  cantidadVendida: number;
  precioUnitario?: number;
  descuento?: number;
  impuestos?: number;
}

export interface IVentaCreate {
  idVendedor: string;
  productos: Array<IProductoVentaCreate>;
  metodoPago: {
    idMetodoPago: string;
    nombreMetodoPago: string;
    fechaEmisionResumen?: Date;
  };
}

export interface IResumenVenta {
  ventasDia: Array<IVenta>;
  fechaEmisionResumen: Date;
  totalDia: number;
  ventasPorVendedor: Record<string, number>;
}