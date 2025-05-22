import Router from "express";

import { ProductoController } from "../controllers/producto.controller";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = Router();

router.post(
  "/registrar-producto",
  authenticateToken,
  ProductoController.registrarProducto
);
router.put(
  "/actualizar-producto/:id",
  authenticateToken,
  ProductoController.actualizarProducto
);
router.post("/aumentar-stock/",authenticateToken,ProductoController.aumentarStockController)
router.get("/listar-productos",authenticateToken, ProductoController.listar);

export { router as productoRoutes };
