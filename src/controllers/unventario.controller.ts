// import { ProductoModel } from "../models/producto/producto.model";

// export class Inventario {
//   async listarProductosPorCategoria() {
//     const productos = await ProductoModel.find({});

//     const categoriasMap = new Map();

//     for (const p of productos) {
//       const productoFormateado = {
//         idProducto: p.idProducto,
//         nombre: p.nombre,
//         cantidad: p.cantidad,
//         precio: p.precio,
//       };

//       if (!categoriasMap.has(p.categoria)) {
//         categoriasMap.set(p.categoria, {
//           nombreCategoria: p.categoria,
//           descripcion: "", // Puedes personalizar descripciones aquí
//           productos: [productoFormateado],
//         });
//       } else {
//         categoriasMap.get(p.categoria)?.productos.push(productoFormateado);
//       }
//     }

//     return {
//       categorias: Array.from(categoriasMap.values()),
//     };
//   }
// }
