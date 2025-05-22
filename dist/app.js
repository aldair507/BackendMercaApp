"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { PORT } from "./config/server.config";
const path_1 = __importDefault(require("path"));
const database_1 = require("./config/database");
const usuario_routes_1 = require("./routes/usuario.routes");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = require("./routes/auth.routes");
const morgan_1 = __importDefault(require("morgan"));
const admin_routes_1 = require("./routes/admin.routes");
const cors_1 = __importDefault(require("cors"));
const venta_routes_1 = require("./routes/venta.routes");
const producto_routes_1 = require("./routes/producto.routes");
const body_parser_1 = __importDefault(require("body-parser"));
const metodoPago_1 = require("./controllers/metodoPago");
const metodoPago_routes_1 = require("./routes/metodoPago.routes");
const app = (0, express_1.default)();
(0, metodoPago_1.inicializarMetodosPago)();
app.use((0, morgan_1.default)("dev"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
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
}));
const PORT = 4000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)()); // <-- antes de las rutas
app.use("/api/usuarios", usuario_routes_1.usuarioRouter);
app.use("/api/auth", auth_routes_1.authRouter);
app.use("/api/admin", admin_routes_1.adminRoutes);
app.use("/api", venta_routes_1.ventaRouter);
app.use("/api/productos", producto_routes_1.productoRoutes);
app.use("/api/pagos", metodoPago_routes_1.metodoPagoRouter);
app.use("/comprobantes", express_1.default.static(path_1.default.join(__dirname, "public/comprobantes")));
app.get("/test", (req, res) => {
    res.json({ success: true, message: "Ruta de prueba funcionando" });
});
(0, database_1.connectDB)();
app.listen(PORT || 4000, "0.0.0.0", () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
exports.default = app;
