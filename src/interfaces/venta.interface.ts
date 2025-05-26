import { Document, Types } from "mongoose";
export type EstadoPago = 'pendiente' | 'aprovado' | 'rechazado' | 'cancelado';

export interface ProductoVentaDTO {
  idProducto: string;
  cantidadVendida: number;
}

export interface ProductoVentaDetalle extends ProductoVentaDTO {
  nombre?: string;
  categoria?: string;
  precioUnitario?: number;
  descuento?: number;
  impuestos?: number;
  subtotal?: number;
}

export interface CompradorInfo {
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  identificacion?: string;
}

export interface RedirectUrls {
  success?: string;
  failure?: string;
  pending?: string;
}

export interface IVenta extends Document {
  idVenta: string;
  fechaVenta: Date;
  productos: ProductoVentaDetalle[];
  IdMetodoPago: string;
  total: number;
  vendedor: Types.ObjectId;

  paymentId?: string;
  externalReference?: string;
  estadoPago?: EstadoPago;
  compradorInfo?: Omit<CompradorInfo, 'identificacion'>;
}

export interface VentaData {
  productos: ProductoVentaDTO[];
  IdMetodoPago: string;
  compradorInfo?: CompradorInfo;
  redirectUrls?: RedirectUrls;
}

export interface VentaResponse {
  success: boolean;
  data?: any;
  mensaje?: string;
  error?: string;
  mercadoPagoData?: {
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint: string;
    ventaId: string;
    total: number;
  };
}
