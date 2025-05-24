import { ProductoModel } from "../models/producto.model";
import { IProductoCreate } from "../interfaces/producto.interface";

export class ProductoService {
  static async registrarProducto(data: any) {
    try {
      // Validación de campos obligatorios
      const camposObligatorios = [
        "idProducto",
        "nombre",
        "cantidad",
        "categoria",
        "precio",
      ];
      const camposFaltantes = camposObligatorios.filter(
        (campo) => !data[campo]
      );

      if (camposFaltantes.length > 0) {
        return {
          success: false,
          error: `Faltan campos obligatorios: ${camposFaltantes.join(", ")}`,
        };
      }

      // Conversión de tipos y sanitización
      const productoData: IProductoCreate = {
        idProducto: String(data.idProducto),
        nombre: String(data.nombre),
        cantidad: Number(data.cantidad),
        categoria: String(data.categoria),
        precio: Number(data.precio),
        descuento:
          data.descuento !== undefined ? Number(data.descuento) : undefined,
        estado: data.estado !== undefined ? Boolean(data.estado) : undefined,
      };

      // Validaciones de negocio
      if (productoData.cantidad < 0) {
        return {
          success: false,
          error: "La cantidad no puede ser negativa",
        };
      }

      if (productoData.precio <= 0) {
        return {
          success: false,
          error: "El precio debe ser mayor que cero",
        };
      }

      // Verificar si ya existe el ID del producto
      const productoExistente = await ProductoModel.findOne({
        idProducto: productoData.idProducto,
      });

      if (productoExistente) {
        return {
          success: false,
          error: "El ID del producto ya está registrado",
        };
      }

      // Guardar producto
      const nuevoProducto = new ProductoModel(productoData);
      const productoGuardado = await nuevoProducto.save();

      return {
        success: true,
        data: {
          idProducto: productoGuardado.idProducto,
          nombre: productoGuardado.nombre,
          cantidad: productoGuardado.cantidad,
          categoria: productoGuardado.categoria,
          precio: productoGuardado.precio,
          descuento: productoGuardado.descuento,
          estado: productoGuardado.estado,
          fechaCreacionProducto: productoGuardado.fechaCreacionProducto,
        },
      };
    } catch (error: any) {
      console.error("Error registrando producto:", error);
      return {
        success: false,
        error: error.message || "Error al registrar el producto",
      };
    }
  }

  static async actualizarProducto(idProducto: string, data: any) {
    try {
      // Verificar si existe el producto
      const productoExistente = await ProductoModel.findOne({ idProducto });

      if (!productoExistente) {
        return {
          success: false,
          error: "Producto no encontrado",
        };
      }

      // Preparar los datos para actualizar
      const datosActualizados: Partial<IProductoCreate> = {};

      // Solo actualizar los campos que vienen en la solicitud
      if (data.nombre !== undefined)
        datosActualizados.nombre = String(data.nombre);
      if (data.cantidad !== undefined) {
        const cantidad = Number(data.cantidad);
        if (cantidad < 0) {
          return {
            success: false,
            error: "La cantidad no puede ser negativa",
          };
        }
        datosActualizados.cantidad = cantidad;
      }
      if (data.categoria !== undefined)
        datosActualizados.categoria = String(data.categoria);
      if (data.precio !== undefined) {
        const precio = Number(data.precio);
        if (precio <= 0) {
          return {
            success: false,
            error: "El precio debe ser mayor que cero",
          };
        }
        datosActualizados.precio = precio;
      }
      if (data.descuento !== undefined)
        datosActualizados.descuento = Number(data.descuento);
      if (data.estado !== undefined)
        datosActualizados.estado = Boolean(data.estado);

      // Si no hay datos para actualizar
      if (Object.keys(datosActualizados).length === 0) {
        return {
          success: false,
          error: "No se proporcionaron datos para actualizar",
        };
      }

      // Actualizar producto
      const productoActualizado = await ProductoModel.findOneAndUpdate(
        { idProducto },
        { $set: datosActualizados },
        { new: true } // Devuelve el documento actualizado
      );

      // Verificar si se actualizó correctamente
      if (!productoActualizado) {
        return {
          success: false,
          error: "No se pudo actualizar el producto",
        };
      }

      return {
        success: true,
        data: {
          idProducto: productoActualizado.idProducto,
          nombre: productoActualizado.nombre,
          cantidad: productoActualizado.cantidad,
          categoria: productoActualizado.categoria,
          precio: productoActualizado.precio,
          descuento: productoActualizado.descuento,
          estado: productoActualizado.estado,
          fechaCreacionProducto: productoActualizado.fechaCreacionProducto,
        },
      };
    } catch (error: any) {
      console.error("Error actualizando producto:", error);
      return {
        success: false,
        error: error.message || "Error al actualizar el producto",
      };
    }
  }
}
