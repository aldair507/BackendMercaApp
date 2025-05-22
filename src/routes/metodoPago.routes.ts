import express from "express";
import { traerMetodosPago } from "../controllers/metodoPago";

const router = express();

router.get("/metodos-pago", traerMetodosPago);

export { router as metodoPagoRouter };
