"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const authenticateAdmin = (req, res, next) => {
    const usuario = req.user; // viene desde authenticateToken
    // Permitir si es administrador o si es el mismo usuario
    if (usuario?.rol === "administrador") {
        return next();
    }
    res.status(403).json({
        success: false,
        message: "No tienes permisos para modificar este recurso.",
    });
};
exports.authenticateAdmin = authenticateAdmin;
