import { Router } from "express";
import {
  createSale,
  success,
  failure,
  pending,
  webhook,
} from "../controllers/payment.controller";

const paymentRoutes = Router();

paymentRoutes.post("/crear-pago",createSale  );

paymentRoutes.get("/webhook", webhook)

paymentRoutes.get("/success", success);
paymentRoutes.get("/failure", failure);
paymentRoutes.get("/pending", pending);

export default paymentRoutes;
