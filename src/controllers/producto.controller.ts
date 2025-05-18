import { Request, Response, NextFunction } from "express";
import { ProductoService } from "../services/producto.service";
import { Inventario } from "../services/inventario.service";

export class ProductoController {
  static async registrarProducto(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await ProductoService.registrarProducto(req.body);

      if (!resultado.success) {
        res.status(400).json(resultado);
        return;
      }

      res.status(201).json(resultado);
    } catch (error) {
      console.error("Error en controlador de producto:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }
  static async actualizarProducto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const idProducto = req.params.id;

      console.log(idProducto);

      if (!idProducto) {
        res.status(400).json({
          success: false,
          error: "El ID del producto es requerido",
        });
        return;
      }

      const resultado = await ProductoService.actualizarProducto(
        idProducto,
        req.body
      );

      if (resultado.success) {
        res.status(200).json(resultado);
      } else {
        if (resultado.error === "Producto no encontrado") {
          res.status(404).json(resultado);
        } else {
          res.status(400).json(resultado);
        }
      }
    } catch (error: any) {
      next(error);
    }
  }

  static async listar(req: Request, res: Response) {
    const inventario = new Inventario();
    try {
      const resultado = await inventario.listarProductosPorCategoria();
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Error al listar productos por categoría",
      });
    }
  }
}
