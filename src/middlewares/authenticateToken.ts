import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/server.config";
export const authenticateToken = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
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
  jwt.verify(token, JWT_SECRET!, (err: any, user: any) => {
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
