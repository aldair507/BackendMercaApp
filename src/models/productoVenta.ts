// models/ProductoVenta.ts
import { IEstrategiaCalculo } from '../interfaces/calculoVenta';
import { IProductoVenta } from '../interfaces/productoVenta.interface';
import { Schema } from 'mongoose';

export class ProductoVenta {
  constructor(
    public idProducto: string,
    public nombre: string,
    public categoria: string,
    public cantidadVendida: number,
    public precioUnitario: number,
    public descuento: number,
    public impuestos: number,
    private estrategia: IEstrategiaCalculo
  ) {}

  calcularSubtotal(): number {
    return this.estrategia.calcularSubtotal(
      this.precioUnitario,
      this.cantidadVendida,
      this.descuento,
      this.impuestos
    );
  }
}
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
