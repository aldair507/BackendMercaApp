"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ventaRouter = void 0;
// routes/venta.routes.ts
const express_1 = require("express");
const venta_controller_1 = require("../controllers/venta.controller");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const router = (0, express_1.Router)();
exports.ventaRouter = router;
router.post("/registrar-venta", authenticateToken_1.authenticateToken, venta_controller_1.VentaController.registrarVenta);
router.post("/mercadopago", venta_controller_1.VentaController.recibirNotificacion);
router.get("/obtener-ventas", authenticateToken_1.authenticateToken, venta_controller_1.VentaController.obtenerTodasLasVentasController);
router.get("/:idVendedor", authenticateToken_1.authenticateToken, venta_controller_1.VentaController.obtenerVentasPorVendedorController);
router.get("/obtener-venta/:id", authenticateToken_1.authenticateToken, venta_controller_1.VentaController.obtenerVenta);
