"use strict";
// // src/services/inventario.service.ts
// import { IProducto } from '../models/producto/producto.model';
// // Clase auxiliar para simular un producto con datos quemados
// class Producto implements IProducto {
//     idProducto: string;
//     nombre: string;
//     categoria: string;
//     stock: number;
//     precio: number;
//     estado: boolean;
//     descuento: number;
//     fechaCreacionProducto: Date;
//     constructor(data: Omit<IProducto, 'mostrarInformacion' | 'actualizarStock'>) {
//         this.idProducto = data.idProducto;
//         this.nombre = data.nombre;
//         this.categoria = data.categoria;
//         this.stock = data.stock;
//         this.precio = data.precio;
//         this.estado = data.estado;
//         this.descuento = data.descuento;
//         this.fechaCreacionProducto = data.fechaCreacionProducto;
//     }
//     mostrarInformacion(): string {
//         return `Producto: ${this.nombre}, Precio: ${this.precio}, Stock: ${this.stock}`;
//     }
//     actualizarStock(cantidad: number): void {
//         const nuevoStock = this.stock - cantidad;
//         if (nuevoStock < 0) {
//             throw new Error(`Stock insuficiente para el producto ${this.idProducto}`);
//         }
//         this.stock = nuevoStock;
//     }
// }
// export class InventarioService {
//     private productos: IProducto[] = [
//         new Producto({
//             idProducto: "P1",
//             nombre: "Camiseta",
//             categoria: "Ropa",
//             stock: 50,
//             precio: 20,
//             estado: true,
//             descuento: 0,
//             fechaCreacionProducto: new Date(),
//         }),
//         new Producto({
//             idProducto: "P2",
//             nombre: "Pantalón",
//             categoria: "Ropa",
//             stock: 30,
//             precio: 30,
//             estado: true,
//             descuento: 0,
//             fechaCreacionProducto: new Date(),
//         }),
//         new Producto({
//             idProducto: "P3",
//             nombre: "Zapatos",
//             categoria: "Calzado",
//             stock: 20,
//             precio: 50,
//             estado: true,
//             descuento: 0,
//             fechaCreacionProducto: new Date(),
//         }),
//     ];
//     buscarProducto(idProducto: string): IProducto | null {
//         return this.productos.find(p => p.idProducto === idProducto) || null;
//     }
//     actualizarStock(idProducto: string, cantidadVendida: number): void {
//         const producto = this.buscarProducto(idProducto);
//         if (!producto) {
//             throw new Error(`Producto ${idProducto} no encontrado`);
//         }
//         producto.actualizarStock(cantidadVendida);
//     }
//     listarProductos(): IProducto[] {
//         return this.productos.map(p => ({
//             idProducto: p.idProducto,
//             nombre: p.nombre,
//             categoria: p.categoria,
//             stock: p.stock,
//             precio: p.precio,
//             estado: p.estado,
//             descuento: p.descuento,
//             fechaCreacionProducto: p.fechaCreacionProducto,
//             mostrarInformacion: p.mostrarInformacion.bind(p),
//             actualizarStock: p.actualizarStock.bind(p),
//         }));
//     }
// }
