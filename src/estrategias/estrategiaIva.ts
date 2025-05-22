// estrategias/EstrategiaConIVA.ts
import { IEstrategiaCalculo } from "../interfaces/calculoVenta";

export class EstrategiaConIVA implements IEstrategiaCalculo {
  calcularSubtotal(
    precio: number,
    cantidad: number,
    descuento: number,
    impuestos: number
  ): number {
    const subtotal = precio * cantidad;
    const descuentoAplicado = subtotal * (descuento / 100);
    const base = subtotal - descuentoAplicado;
    const impuestosAplicados = base * (impuestos / 100);
    return base + impuestosAplicados;
  }
}
