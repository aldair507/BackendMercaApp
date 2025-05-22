// models/ProductoVenta.ts
import { IEstrategiaCalculo } from '../../interfaces/calculoVenta';

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
