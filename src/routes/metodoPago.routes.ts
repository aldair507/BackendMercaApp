import express from "express";
import { traerMetodosPago } from "../controllers/metodoPago";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = express();

router.get("/metodos-pago",authenticateToken, traerMetodosPago);

export { router as metodoPagoRouter };
