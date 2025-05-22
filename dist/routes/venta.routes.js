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
router.get("/obtener-ventas", venta_controller_1.VentaController.obtenerTodasLasVentasController);
router.get("/:idVendedor", venta_controller_1.VentaController.obtenerVentasPorVendedorController);
