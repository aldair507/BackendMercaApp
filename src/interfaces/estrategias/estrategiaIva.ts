import { IEstrategiaCalculo } from "../calculoVenta";

export class EstrategiaConIVA implements IEstrategiaCalculo {
  calcularTotal(precio: number, cantidad: number, descuento: number, impuestos: number): number {
    if (precio < 0 || cantidad < 0 || descuento < 0 || impuestos < 0) {
      throw new Error("Los valores no pueden ser negativos");
    }

    if (descuento > 100 || impuestos > 100) {
      throw new Error("Los porcentajes no pueden ser mayores a 100");
    }

    const precioBase = precio * cantidad;
    const montoDescuento = precioBase * (descuento / 100);
    const precioConDescuento = precioBase - montoDescuento;
    const montoImpuestos = precioConDescuento * (impuestos / 100);
    const total = precioConDescuento + montoImpuestos;

    return Number(total.toFixed(2));
  }

  calcularSubtotal(precio: number, cantidad: number, descuento: number, impuestos: number): number {
    if (precio < 0 || cantidad < 0 || descuento < 0 || impuestos < 0) {
      throw new Error("Los valores no pueden ser negativos");
    }
    
    if (descuento > 100 || impuestos > 100) {
      throw new Error("Los porcentajes no pueden ser mayores a 100");
    }

    const precioBase = precio * cantidad;
    const montoDescuento = precioBase * (descuento / 100);
    const precioConDescuento = precioBase - montoDescuento;
    const montoImpuestos = precioConDescuento * (impuestos / 100);
    
    return Number((precioConDescuento + montoImpuestos).toFixed(2));
  }
}