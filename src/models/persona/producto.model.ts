import { iProducto } from '../../interfaces/producto.interface';


export class Producto implements Producto {
  idProducto: string;
  nombre: string;
  cantidad: number;
  categoria: string;
  precio: number;
  estado: boolean;
  descuento: number;
  fechaCreacionProducto: Date;

  constructor(
    idProducto: string,
    nombre: string,
    cantidad: number,
    categoria: string,
    precio: number,
    estado: boolean,
    descuento: number,
    fechaCreacionProducto: Date
  ) {
    this.idProducto = idProducto;
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.categoria = categoria;
    this.precio = precio;
    this.estado = estado;
    this.descuento = descuento;
    this.fechaCreacionProducto = fechaCreacionProducto;
  }

  mostrarInformacion(): void {
    console.log(`Del producto: ${this.nombre}, Este es el precio: $${this.precio}`);
  }

  actualizarStock(nuevaCantidad: number): void {
    this.cantidad = nuevaCantidad;
  }
}
