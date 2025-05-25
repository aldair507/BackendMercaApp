import { Router } from "express";
import { AdminController } from "../controllers/Admin.controllers";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authenticateAdmin } from "../middlewares/authenticateAdmin";
import { UsuarioController } from "../controllers/persona.controllers";
import { VentaController } from "../controllers/venta.controller";
import { ProductoController } from "../controllers/producto.controller";
import { SolicitudCambioRolController } from "../controllers/cambioRol.controllers";
const router = Router();

// Usuarios
router.post("/registrar-usuario", authenticateToken, authenticateAdmin, AdminController.registroUsuarioConRol);
router.put("/actualizar-usuario/:id", authenticateToken, authenticateAdmin, UsuarioController.actualizarUsuario);
router.get("/usuarios", authenticateToken, UsuarioController.getUsuarios);

// Ventas
router.post("/ventas/registrar-venta", authenticateToken, VentaController.registrarVenta);
router.get("/ventas", VentaController.obtenerTodasLasVentasController);
router.get("/ventas/:id", VentaController.obtenerVentasPorVendedorController);

// Productos
router.post("/registrar-producto", authenticateToken, ProductoController.registrarProducto);
router.put("/actualizar-producto/:id", authenticateToken, ProductoController.actualizarProducto);
router.post("/aumentar-stock", authenticateToken, ProductoController.aumentarStockController);
router.get("/listar-productos", authenticateToken, ProductoController.listar);


router.post('/solicitar-cambio-rol', 
  authenticateToken, 
  SolicitudCambioRolController.crearSolicitud
);

router.get('/mis-solicitudes', 
  authenticateToken, 
  SolicitudCambioRolController.obtenerMisSolicitudes
);

// Rutas para administradores
router.get('/admin/solicitudes-pendientes', 
  authenticateToken, 
  SolicitudCambioRolController.obtenerSolicitudesPendientes
);

router.put('/admin/responder-solicitud/:solicitudId', 
  authenticateToken, 
  SolicitudCambioRolController.responderSolicitud
);

export { router as adminRoutes };
