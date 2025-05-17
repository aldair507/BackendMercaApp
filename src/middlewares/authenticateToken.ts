import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/server.config";
export const authenticateToken = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): void => {
  const tokenFromCookie = req.cookies?.jwt;
  const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : req.headers.sessiontoken;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "No se encontró token de autenticación",
    });
    return;
  }

  jwt.verify(token, JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      res.clearCookie("jwt");
      res.status(403).json({
        success: false,
        message: "Token inválido o expirado",
      });
      return;
    }

    req.user = user;
    next();
  });
};
