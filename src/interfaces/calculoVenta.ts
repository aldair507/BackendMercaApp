export interface IEstrategiaCalculo {
  calcularSubtotal(
    precio: number,
    cantidad: number,
    descuento: number,
    impuestos: number
  ): number;
  
  calcularTotal(
    precio: number,
    cantidad: number,
    descuento: number,
    impuestos: number
  ): number;
}