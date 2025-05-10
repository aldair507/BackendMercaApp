import { Request, Response, NextFunction } from "express";

export const authenticateAdmin = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
):void => {
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
