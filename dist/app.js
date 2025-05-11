"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_config_1 = require("./config/server.config");
const database_1 = require("./config/database");
const usuario_routes_1 = require("./routes/usuario.routes");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = require("./routes/auth.routes");
const morgan_1 = __importDefault(require("morgan"));
const admin_routes_1 = require("./routes/admin.routes");
const app = (0, express_1.default)();
(0, database_1.connectDB)();
app.use(express_1.default.json());
app.use("/api", usuario_routes_1.usuarioRouter);
app.use("/api/auth", auth_routes_1.authRouter);
app.use("/api/admin", admin_routes_1.adminRoutes);
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
app.listen(server_config_1.PORT, () => {
    console.log("Server is running on port", server_config_1.PORT);
});
