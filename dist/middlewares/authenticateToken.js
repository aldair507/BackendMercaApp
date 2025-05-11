"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_config_1 = require("../config/server.config");
const authenticateToken = (req, res, next) => {
    // 1. Obtener el token de las cookies o header
    const tokenFromCookie = req.cookies?.jwt;
    const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.sessiontoken;
    const token = tokenFromCookie || tokenFromHeader;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No se encontró token de autenticación",
        });
    }
    // 2. Verificar el token
    jsonwebtoken_1.default.verify(token, server_config_1.JWT_SECRET, (err, user) => {
        if (err) {
            res.clearCookie("jwt");
            return res.status(403).json({
                success: false,
                message: "Token inválido o expirado",
            });
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
