"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productoRoutes = void 0;
const express_1 = __importDefault(require("express"));
const producto_controller_1 = require("../controllers/producto.controller");
const router = (0, express_1.default)();
exports.productoRoutes = router;
router.post("/registrar-producto", producto_controller_1.ProductoController.registrarProducto);
router.get("/", producto_controller_1.ProductoController.listar);
