import express from "express";
import { PORT } from "./config/server.config";
import { connectDB } from "./config/database";
import { usuarioRouter } from "./routes/usuario.routes";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.routes";
import morgan from "morgan";
import { adminRoutes } from "./routes/admin.routes";
import cors from "cors";

const app = express();

connectDB();

app.use(morgan("dev"));
app.use(
  cors({
    origin: [
    'http://localhost:8081/',
    'http://localhost:19006/',
    'http://10.0.2.2:8081/',
    'exp://10.0.2.2:8081'
  ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'sessiontoken',
      'Access-Control-Allow-Credentials',
      'Accept'
    ],
    credentials: true,
    exposedHeaders: ['sessiontoken'],
    maxAge: 86400,
  })
);
app.use(express.json());
app.use(cookieParser()); // <-- antes de las rutas

app.use("/api", usuarioRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRoutes);
app.get("/test", (req, res) => {
  res.json({ success: true, message: "Ruta de prueba funcionando" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log("Server is running on port", PORT);
});
