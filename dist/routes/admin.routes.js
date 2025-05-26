"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const Admin_controllers_1 = require("../controllers/Admin.controllers");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const authenticateAdmin_1 = require("../middlewares/authenticateAdmin");
const persona_controllers_1 = require("../controllers/persona.controllers");
const venta_controller_1 = require("../controllers/venta.controller");
const producto_controller_1 = require("../controllers/producto.controller");
const cambioRol_controllers_1 = require("../controllers/cambioRol.controllers");
const router = (0, express_1.Router)();
exports.adminRoutes = router;
// Usuarios
router.post("/registrar-usuario", authenticateToken_1.authenticateToken, authenticateAdmin_1.authenticateAdmin, Admin_controllers_1.AdminController.registroUsuarioConRol);
router.put("/actualizar-usuario/:id", authenticateToken_1.authenticateToken, authenticateAdmin_1.authenticateAdmin, persona_controllers_1.UsuarioController.actualizarUsuario);
router.get("/usuarios", authenticateToken_1.authenticateToken, persona_controllers_1.UsuarioController.getUsuarios);
// Ventas
router.post("/ventas/registrar-venta", authenticateToken_1.authenticateToken, venta_controller_1.VentaController.registrarVenta);
router.get("/ventas", venta_controller_1.VentaController.obtenerTodasLasVentasController);
router.get("/ventas/:id", venta_controller_1.VentaController.obtenerVentasPorVendedorController);
// Productos
router.post("/registrar-producto", authenticateToken_1.authenticateToken, producto_controller_1.ProductoController.registrarProducto);
router.put("/actualizar-producto/:id", authenticateToken_1.authenticateToken, producto_controller_1.ProductoController.actualizarProducto);
router.post("/aumentar-stock", authenticateToken_1.authenticateToken, producto_controller_1.ProductoController.aumentarStockController);
router.get("/listar-productos", authenticateToken_1.authenticateToken, producto_controller_1.ProductoController.listar);
router.post('/solicitar-cambio-rol', authenticateToken_1.authenticateToken, cambioRol_controllers_1.SolicitudCambioRolController.crearSolicitud);
router.get('/mis-solicitudes', authenticateToken_1.authenticateToken, cambioRol_controllers_1.SolicitudCambioRolController.obtenerMisSolicitudes);
// Rutas para administradores
router.get('/admin/solicitudes-pendientes', authenticateToken_1.authenticateToken, cambioRol_controllers_1.SolicitudCambioRolController.obtenerSolicitudesPendientes);
router.put('/admin/responder-solicitud/:solicitudId', authenticateToken_1.authenticateToken, cambioRol_controllers_1.SolicitudCambioRolController.responderSolicitud);
