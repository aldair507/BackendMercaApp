"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productoRoutes = void 0;
const express_1 = __importDefault(require("express"));
const producto_controller_1 = require("../controllers/producto.controller");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const router = (0, express_1.default)();
exports.productoRoutes = router;
router.post("/registrar-producto", authenticateToken_1.authenticateToken, producto_controller_1.ProductoController.registrarProducto);
router.put("/actualizar-producto/:id", authenticateToken_1.authenticateToken, producto_controller_1.ProductoController.actualizarProducto);
router.post("/aumentar-stock/", authenticateToken_1.authenticateToken, producto_controller_1.ProductoController.aumentarStockController);
router.get("/", authenticateToken_1.authenticateToken, producto_controller_1.ProductoController.listar);
