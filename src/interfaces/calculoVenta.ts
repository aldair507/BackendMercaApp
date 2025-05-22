// estrategias/IEstrategiaCalculo.ts
export interface IEstrategiaCalculo {
  calcularSubtotal(
    precio: number,
    cantidad: number,
    descuento: number,
    impuestos: number
  ): number;
}
