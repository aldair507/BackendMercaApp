"use strict";
// import { MicroempresarioModel } from "../models/microempresario/microempresario.model";
// import { ProductoModel } from "../models/producto/producto.model";
// import { IMicroempresario } from "../interfaces/microempresario.interfaces";
// export class MicroempresarioService {
//   /**
//    * Agrega un producto y lo asocia al microempresario
//    */
//   public static async agregarProducto(
//     idMicroempresario: string,
//     productoData: any
//   ) {
//     const session = await MicroempresarioModel.startSession();
//     session.startTransaction();
//     try {
//       // 1. Crear el producto
//       const [nuevoProducto] = await ProductoModel.create([productoData], {
//         session,
//       });
//       // 2. Buscar al microempresario y castear correctamente
//       const microempresario = await MicroempresarioModel.findById(
//         idMicroempresario
//       ).session(session) as IMicroempresario | null;
//       if (!microempresario) {
//         throw new Error("Microempresario no encontrado");
//       }
//       // 3. Usar el método del esquema
//       await microempresario.agregarProducto(nuevoProducto._id);
//       await session.commitTransaction();
//       return {
//         success: true,
//         data: nuevoProducto,
//       };
//     } catch (error) {
//       await session.abortTransaction();
//       console.error("Error en agregarProducto:", error);
//       return {
//         success: false,
//         error:
//           error instanceof Error ? error.message : "Error al agregar producto",
//       };
//     } finally {
//       session.endSession();
//     }
//   }
//   /**
//    * Obtiene el inventario con población de datos
//    */
//   public static async obtenerInventarioCompleto(idMicroempresario: string) {
//     try {
//       const resultado = await MicroempresarioModel.findById(idMicroempresario)
//         .populate({
//           path: "productos",
//           select: "-__v -createdAt -updatedAt",
//         })
//         .select("productos")
//         .lean();
//       return {
//         success: true,
//         data: resultado?.productos || [],
//       };
//     } catch (error) {
//       console.error("Error en obtenerInventarioCompleto:", error);
//       return {
//         success: false,
//         error: "Error al obtener inventario",
//       };
//     }
//   }
// }
