import { Router } from "express";
import { AdminController } from "../controllers/Admin.controllers";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authenticateAdmin } from "../middlewares/authenticateAdmin";
import { UsuarioController } from "../controllers/persona.controllers";
import { VentaController } from "../controllers/venta.controller";
import { ProductoController } from "../controllers/producto.controller";
const router = Router();

router.post(
  "/register",
  authenticateToken,
  authenticateAdmin,
  AdminController.registroUsuarioConRol
);
router.post(
  "/registrar-venta",
  authenticateToken,
  VentaController.registrarVenta
);
router.put(
  "/update/:id",
  authenticateToken,
  authenticateAdmin,
  UsuarioController.actualizarUsuario
);
router.get("/", VentaController.obtenerTodasLasVentasController);
router.get("/:idVendedor", VentaController.obtenerVentasPorVendedorController);

router.get("/usuarios", authenticateToken, UsuarioController.getUsuarios);
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
router.get("/",authenticateToken, ProductoController.listar);

export { router as adminRoutes };
