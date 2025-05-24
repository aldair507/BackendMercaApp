"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metodoPagoRouter = void 0;
const express_1 = __importDefault(require("express"));
const metodoPago_1 = require("../controllers/metodoPago");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const router = (0, express_1.default)();
exports.metodoPagoRouter = router;
router.get("/metodos-pago", authenticateToken_1.authenticateToken, metodoPago_1.traerMetodosPago);
