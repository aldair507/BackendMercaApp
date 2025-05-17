import express from "express";
// import { PORT } from "./config/server.config";
import { connectDB } from "./config/database";
import { usuarioRouter } from "./routes/usuario.routes";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.routes";
import morgan from "morgan";
import { adminRoutes } from "./routes/admin.routes";
import cors from "cors";
import { ventaRouter } from "./routes/venta.routes";
import { productoRoutes } from "./routes/producto.routes";
import bodyParser from 'body-parser';

const app = express();

connectDB();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:8081/",
      "http://localhost:19006/",
      "http://10.0.2.2:8081/",
      "exp://10.0.2.2:8081",
    ],

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
app.use(cookieParser()); // <-- antes de las rutas

app.use("/api", usuarioRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/ventas", ventaRouter);
app.use("/api/productos", productoRoutes);
app.get("/test", (req, res) => {
  res.json({ success: true, message: "Ruta de prueba funcionando" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server is running on port", PORT);
});
