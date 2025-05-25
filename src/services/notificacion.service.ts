import { NotificacionModel } from '../models/notificacion.model';
import { INotificacion } from '../interfaces/INotificacion.interface';
import { PersonaModel } from '../models/persona.model';

export class NotificacionService {

  // Crear notificación individual
  public static async crearNotificacion(datosNotificacion: {
    usuarioDestino: string;
    tipoNotificacion: string;
    titulo: string;
    mensaje: string;
    referenciaDocumento?: string;
    datosAdicionales?: any;
  }): Promise<{
    success: boolean;
    data?: INotificacion;
    error?: string;
  }> {
    try {
      const nuevaNotificacion = new NotificacionModel(datosNotificacion);
      const notificacionGuardada = await nuevaNotificacion.save();

      return {
        success: true,
        data: notificacionGuardada
      };

    } catch (error) {
      console.error('Error creando notificación:', error);
      return {
        success: false,
        error: 'Error interno al crear notificación'
      };
    }
  }

  // Notificar a todos los administradores
  public static async notificarAdministradores(datosNotificacion: {
    tipoNotificacion: string;
    titulo: string;
    mensaje: string;
    referenciaDocumento?: string;
  }): Promise<void> {
    try {
      const administradores = await PersonaModel.find({
        rol: 'administrador',
        estadoPersona: true
      }).select('idPersona').lean();

      const promesasNotificaciones = administradores.map(admin =>
        this.crearNotificacion({
          usuarioDestino: admin.idPersona.toString(),
          ...datosNotificacion
        })
      );

      await Promise.all(promesasNotificaciones);

    } catch (error) {
      console.error('Error notificando a administradores:', error);
    }
  }

  // Obtener notificaciones de un usuario
   static async obtenerNotificacionesUsuario(
    usuarioId: string,
    soloNoLeidas: boolean = false
  ): Promise<{
    success: boolean;
    data?: INotificacion[];
    error?: string;
  }> {
    try {
      const filtro: any = { usuarioDestino: usuarioId };
      if (soloNoLeidas) {
        filtro.leida = false;
      }

      const notificaciones = await NotificacionModel.find(filtro)
        .sort({ fechaCreacion: -1 })
        .limit(50)
        .lean();

      return {
        success: true,
        data: notificaciones
      };

    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      return {
        success: false,
        error: 'Error interno al obtener notificaciones'
      };
    }
  }

  // Marcar notificación como leída
   static async marcarComoLeida(
    notificacionId: string,
    usuarioId: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const resultado = await NotificacionModel.findOneAndUpdate(
        {
          idNotificacion: notificacionId,
          usuarioDestino: usuarioId,
          leida: false
        },
        {
          $set: {
            leida: true,
            fechaLeida: new Date()
          }
        }
      );

      if (!resultado) {
        return {
          success: false,
          error: 'Notificación no encontrada o ya leída'
        };
      }

      return { success: true };

    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      return {
        success: false,
        error: 'Error interno al actualizar notificación'
      };
    }
  }

  // Marcar todas las notificaciones como leídas
   static async marcarTodasComoLeidas(usuarioId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await NotificacionModel.updateMany(
        {
          usuarioDestino: usuarioId,
          leida: false
        },
        {
          $set: {
            leida: true,
            fechaLeida: new Date()
          }
        }
      );

      return { success: true };

    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      return {
        success: false,
        error: 'Error interno al actualizar notificaciones'
      };
    }
  }

  // Contar notificaciones no leídas
  public static async contarNoLeidas(usuarioId: string): Promise<{
    success: boolean;
    data?: number;
    error?: string;
  }> {
    try {
      const cantidad = await NotificacionModel.countDocuments({
        usuarioDestino: usuarioId,
        leida: false
      });

      return {
        success: true,
        data: cantidad
      };

    } catch (error) {
      console.error('Error contando notificaciones no leídas:', error);
      return {
        success: false,
        error: 'Error interno al contar notificaciones'
      };
    }
  }
}