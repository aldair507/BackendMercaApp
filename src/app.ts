import express from "express";
import { PORT } from "./config/server.config";
import { connectDB } from "./config/database";
import { usuarioRouter } from "./routes/usuario.routes";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.routes";
import morgan from "morgan";
import { adminRoutes } from "./routes/admin.routes";

const app = express();

connectDB();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser()); // <-- antes de las rutas

app.use("/api", usuarioRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRoutes);



app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
