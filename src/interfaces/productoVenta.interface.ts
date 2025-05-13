export interface IProductoVenta {
  idProducto: string;
  nombre: string;
  cantidadVendida: number;
  precioUnitario: number;
  descuento?: number;
  impuestos?: number;
  subtotal: number;
}