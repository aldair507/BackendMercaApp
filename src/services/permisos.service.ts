import { PersonaModel } from "../models/persona/persona.model";
import { Permisos, IAdministrador } from "../types/permisos.types";

export class PermisosService {
  /**
   * Agrega permisos a un usuario administrador
   */
  public static async agregarPermisos(
    idAdministrador: string,
    idUsuario: string,
    permisosAAgregar: Permisos[]
  ): Promise<{
    success: boolean;
    error?: string;
    usuarioActualizado?: IAdministrador;
  }> {
    try {
      // Validar que el ejecutor tiene permisos
      const puedeGestionar = await this.tienePermiso(
        idAdministrador,
        Permisos.GESTIONAR_PERMISOS,
        idUsuario
      );
      if (!puedeGestionar.success) {
        return { 
          success: false, 
          error: puedeGestionar.error || "No tiene permisos para gestionar permisos" 
        };
      }

      // Verificar jerarquía - obtener datos de los administradores
      const adminEjecutor = await PersonaModel.findOne({ idPersona: idAdministrador, rol: "administrador" });
      const adminObjetivo = await PersonaModel.findOne({ idPersona: idUsuario, rol: "administrador" });
      
      if (!adminObjetivo) {
        return { success: false, error: "Usuario objetivo no encontrado o no es administrador" };
      }
      
      if (!adminEjecutor) {
        return { success: false, error: "Administrador ejecutor no encontrado" };
      }

      // Actualizar agregando nuevos permisos (sin duplicados)
      const resultado = await PersonaModel.findOneAndUpdate(
        { idPersona: idUsuario, rol: "administrador" },
        {
          $addToSet: { permisos: { $each: permisosAAgregar } }
        },
        { new: true }
      );

      if (!resultado) {
        return { success: false, error: "Usuario no encontrado o no es administrador" };
      }

      return { 
        success: true, 
        usuarioActualizado: resultado.toObject() as unknown as IAdministrador 
      };
    } catch (error) {
      console.error("Error en agregarPermisos:", error);
      return { success: false, error: "Error interno al agregar permisos" };
    }
  }

  /**
   * Quita permisos de un usuario administrador
   */
  public static async quitarPermisos(
    idAdministrador: string,
    idUsuario: string,
    permisosAQuitar: Permisos[]
  ): Promise<{
    success: boolean;
    error?: string;
    usuarioActualizado?: IAdministrador;
  }> {
    try {
      // Validar que el ejecutor no se está quitando permisos a sí mismo
      if (idAdministrador === idUsuario) {
        return { success: false, error: "No puede modificarse sus propios permisos" };
      }

      // Validar permisos del ejecutor
      const puedeGestionar = await this.tienePermiso(
        idAdministrador,
        Permisos.GESTIONAR_PERMISOS,
        idUsuario
      );
      if (!puedeGestionar.success) {
        return { 
          success: false, 
          error: puedeGestionar.error || "No tiene permisos para gestionar permisos" 
        };
      }

      // Verificar que ambos usuarios existen y son administradores
      const adminEjecutor = await PersonaModel.findOne({ idPersona: idAdministrador, rol: "administrador" });
      const adminObjetivo = await PersonaModel.findOne({ idPersona: idUsuario, rol: "administrador" });
      
      if (!adminObjetivo) {
        return { success: false, error: "Usuario objetivo no encontrado o no es administrador" };
      }
      
      if (!adminEjecutor) {
        return { success: false, error: "Administrador ejecutor no encontrado" };
      }

      // Verificar que no se quitan todos los permisos
      const adminActual = adminObjetivo.toObject() as unknown as IAdministrador;
      const permisosRestantes = adminActual.permisos.filter(
        permiso => !permisosAQuitar.includes(permiso)
      );
      
      if (permisosRestantes.length === 0) {
        return { 
          success: false, 
          error: "No se pueden quitar todos los permisos a un administrador" 
        };
      }

      // Proteger contra la eliminación de permisos críticos si es administrador principal
      const esAdminPrincipal = await this.esAdministradorPrincipal(idUsuario);
      if (esAdminPrincipal && permisosAQuitar.includes(Permisos.GESTIONAR_PERMISOS)) {
        return {
          success: false,
          error: "No se puede quitar el permiso de gestión al administrador principal"
        };
      }

      // Actualizar quitando los permisos especificados
      const resultado = await PersonaModel.findOneAndUpdate(
        { idPersona: idUsuario, rol: "administrador" },
        {
          $pull: { permisos: { $in: permisosAQuitar } }
        },
        { new: true }
      );

      if (!resultado) {
        return { success: false, error: "Usuario no encontrado o no es administrador" };
      }

      return { 
        success: true, 
        usuarioActualizado: resultado.toObject() as unknown as IAdministrador 
      };
    } catch (error) {
      console.error("Error en quitarPermisos:", error);
      return { success: false, error: "Error interno al quitar permisos" };
    }
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  public static async tienePermiso(
    idUsuario: string,
    permisoRequerido: Permisos,
    idUsuarioAGestionar?: string
  ): Promise<{ success: boolean; error?: string }> {
    const usuario = await PersonaModel.findOne({ idPersona: idUsuario });
    
    if (!usuario) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Si no es administrador, no tiene permisos
    if (usuario.rol !== "administrador") {
      return { success: false, error: "El usuario no tiene rol de administrador" };
    }

    // Verificar si es administrador principal (tiene todos los permisos)
    const esAdminPrincipal = await this.esAdministradorPrincipal(idUsuario);
    if (esAdminPrincipal) {
      return { success: true };
    }

    // Verificar permisos directos
    const usuarioAdmin = usuario.toObject() as unknown as IAdministrador;
    const tienePermiso = usuarioAdmin.permisos?.includes(permisoRequerido);
    if (!tienePermiso) {
      return { success: false, error: "No tiene los permisos necesarios" };
    }

    // Verificar gestión de usuarios específicos si aplica
    if (idUsuarioAGestionar && usuarioAdmin.usuariosGestionados) {
      // Un administrador siempre puede gestionarse a sí mismo
      if (idUsuario === idUsuarioAGestionar) {
        return { success: true };
      }
      
      const puedeGestionar = usuarioAdmin.usuariosGestionados.includes(idUsuarioAGestionar);
      if (!puedeGestionar) {
        return { success: false, error: "No tiene permisos para gestionar este usuario" };
      }
    }

    return { success: true };
  }
  
  /**
   * Verifica si un administrador es considerado "principal"
   * (tiene todos los permisos por defecto)
   */
  private static async esAdministradorPrincipal(idUsuario: string): Promise<boolean> {
    // Verificar si es el primer administrador registrado o tiene flag de admin principal
    const admin = await PersonaModel.findOne({ idPersona: idUsuario, rol: "administrador" });
    if (!admin) return false;
    

    
    // Ejemplo: un admin es principal si tiene el permiso GESTIONAR_PERMISOS
    const adminObj = admin.toObject() as unknown as IAdministrador;
    return adminObj.permisos?.includes(Permisos.GESTIONAR_PERMISOS) || false;
  }
  
  /**
   * Asigna usuarios a un administrador para que pueda gestionarlos
   */
  public static async asignarUsuariosGestionados(
    idAdminEjecutor: string,
    idAdministrador: string,
    idUsuariosAAsignar: string[]
  ): Promise<{
    success: boolean;
    error?: string;
    usuarioActualizado?: IAdministrador;
  }> {
    try {
      // Validar que quien ejecuta tiene permisos de gestión
      const puedeGestionar = await this.tienePermiso(
        idAdminEjecutor,
        Permisos.GESTIONAR_PERMISOS
      );
      
      if (!puedeGestionar.success) {
        return { 
          success: false, 
          error: puedeGestionar.error || "No tiene permisos para asignar usuarios a gestionar" 
        };
      }

      // Actualizar agregando nuevos usuarios gestionados (sin duplicados)
      const resultado = await PersonaModel.findOneAndUpdate(
        { idPersona: idAdministrador, rol: "administrador" },
        {
          $addToSet: { usuariosGestionados: { $each: idUsuariosAAsignar } }
        },
        { new: true }
      );

      if (!resultado) {
        return { success: false, error: "Administrador no encontrado" };
      }

      return { 
        success: true, 
        usuarioActualizado: resultado.toObject() as unknown as IAdministrador 
      };
    } catch (error) {
      console.error("Error en asignarUsuariosGestionados:", error);
      return { success: false, error: "Error interno al asignar usuarios" };
    }
  }
}