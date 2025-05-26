import { Router } from "express";
import {
  createSale,
  success,
  failure,
  pending,
  webhook,
} from "../controllers/payment.controller";
import { authenticateToken } from "../middlewares/authenticateToken";

const paymentRoutes = Router();

paymentRoutes.post("/crear-pago",authenticateToken,createSale  );

paymentRoutes.get("/webhook", webhook)

paymentRoutes.get("/success", success);
paymentRoutes.get("/failure", failure);
paymentRoutes.get("/pending", pending);

export default paymentRoutes;
