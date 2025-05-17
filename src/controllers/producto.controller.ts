import { Request, Response } from "express";
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
