// routes/venta.routes.ts
import { Router } from "express";
import { VentaController } from "../controllers/venta.controller";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = Router();

router.post(
  "/registrar-venta",
  authenticateToken,
  VentaController.registrarVenta
);
router.get("/obtener-ventas", VentaController.obtenerTodasLasVentasController);
router.get("/:idVendedor", VentaController.obtenerVentasPorVendedorController);

  

export { router as ventaRouter };
