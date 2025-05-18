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
router.post("/aumentar-stock/",ProductoController.aumentarStockController)
router.get("/", ProductoController.listar);

export { router as productoRoutes };
