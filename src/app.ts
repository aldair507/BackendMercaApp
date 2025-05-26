import express from "express";

import { connectDB } from "./config/database";
import { usuarioRouter } from "./routes/usuario.routes";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.routes";
import morgan from "morgan";
import { adminRoutes } from "./routes/admin.routes";
import cors from "cors";
import { ventaRouter } from "./routes/venta.routes";
import { productoRoutes } from "./routes/producto.routes";
import bodyParser from "body-parser";
import { inicializarMetodosPago } from "./controllers/metodoPago";
import { metodoPagoRouter } from "./routes/metodoPago.routes";
import { notificacionRoutes } from "./routes/notificacion.routes";
import paymentRoutes from "./routes/payment.routes";

const app = express();
import { ACCESS_TOKEN } from "./config/server.config";
console.log(ACCESS_TOKEN);

inicializarMetodosPago();
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "sessiontoken",
      "Access-Control-Allow-Credentials",
      "Accept",
    ],
    credentials: true,
    exposedHeaders: ["sessiontoken"],
    maxAge: 86400,
  })
);

const PORT = 4000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // <-- antes de las rutas

app.use("/api/usuarios", usuarioRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/venta", ventaRouter);
app.use("/api/productos", productoRoutes);
app.use("/api/pagos", metodoPagoRouter);
app.use("/api/notificaciones", notificacionRoutes);
app.use("/api/venta", paymentRoutes);

connectDB();

app.listen(PORT || 4000, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

export default app;
