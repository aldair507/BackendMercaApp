// import { Producto } from '../models/producto/producto.model';

// export class ProductoService {
//     private productos: Producto[] = [];

//     constructor() {
//         // Datos quemados iniciales
//         this.productos.push(new Producto("P001", "Camiseta", "Ropa", 20.00, true, 10));
//         this.productos.push(new Producto("P002", "Pantalón", "Ropa", 30.00, true));
//     }

//     getProductos(): Producto[] {
//         return this.productos;
//     }

//     agregarProducto(producto: Producto): void {
//         this.productos.push(producto);
//     }

//     actualizarStock(id: string): void {
//         const producto = this.productos.find(p => p.idProducto === id);
//         if (producto) producto.actualizarStock();
//     }
// }