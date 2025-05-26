import { Router } from "express";
import {
  createSale,
  success,
  failure,
  pending,
} from "../controllers/payment.controller";

const paymentRoutes = Router();

paymentRoutes.post("/create",createSale  );

paymentRoutes.get("/success", success);
paymentRoutes.get("/failure", failure);
paymentRoutes.get("/pending", pending);

export default paymentRoutes;
