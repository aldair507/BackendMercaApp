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
router.post("/mercadopago",VentaController.recibirNotificacion)
router.get("/obtener-ventas",authenticateToken, VentaController.obtenerTodasLasVentasController);
router.get("/:idVendedor",authenticateToken, VentaController.obtenerVentasPorVendedorController);

  

export { router as ventaRouter };
