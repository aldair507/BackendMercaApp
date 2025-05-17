import { Request, Response, NextFunction } from "express";
import { PermisosService } from "../services/permisos.service";
import { Permisos } from "../types/permisos.types";

export function verificarPermiso(permisoRequerido: string, verificarUsuarioGestionado = false) {
  return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      // El usuario ya está autenticado por authenticateToken
      const idUsuario = req.user?.id; // Utilizar el ID correctamente según la estructura del token
      
      if (!idUsuario) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }
      
      // Obtener el ID del usuario a gestionar si es necesario
      let idUsuarioAGestionar;
      if (verificarUsuarioGestionado) {
        idUsuarioAGestionar = req.params.idUsuario || req.body.idUsuario;
        
        if (!idUsuarioAGestionar) {
          return res.status(400).json({
            success: false,
            error: 'ID de usuario a gestionar no proporcionado'
          });
        }
      }
      
      const tienePermiso = await PermisosService.tienePermiso(
        idUsuario, 
        permisoRequerido as Permisos,
        idUsuarioAGestionar
      );
      
      
      if (!tienePermiso.success) {
        return res.status(403).json({
          success: false,
          error: tienePermiso.error || 'No tiene permisos para realizar esta acción'
        });
      }
      
      // Si tiene permisos, continuar
      next();
    } catch (error) {
      console.error('Error en middleware de verificación de permisos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
}