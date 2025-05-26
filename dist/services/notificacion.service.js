"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacionService = void 0;
const notificacion_model_1 = require("../models/notificacion.model");
const persona_model_1 = require("../models/persona.model");
class NotificacionService {
    // Crear notificación individual
    static async crearNotificacion(datosNotificacion) {
        try {
            const nuevaNotificacion = new notificacion_model_1.NotificacionModel(datosNotificacion);
            const notificacionGuardada = await nuevaNotificacion.save();
            return {
                success: true,
                data: notificacionGuardada
            };
        }
        catch (error) {
            console.error('Error creando notificación:', error);
            return {
                success: false,
                error: 'Error interno al crear notificación'
            };
        }
    }
    // Notificar a todos los administradores
    static async notificarAdministradores(datosNotificacion) {
        try {
            const administradores = await persona_model_1.PersonaModel.find({
                rol: 'administrador',
                estadoPersona: true
            }).select('idPersona').lean();
            const promesasNotificaciones = administradores.map(admin => this.crearNotificacion({
                usuarioDestino: admin.idPersona.toString(),
                ...datosNotificacion
            }));
            await Promise.all(promesasNotificaciones);
        }
        catch (error) {
            console.error('Error notificando a administradores:', error);
        }
    }
    // Obtener notificaciones de un usuario
    static async obtenerNotificacionesUsuario(usuarioId, soloNoLeidas = false) {
        try {
            const filtro = { usuarioDestino: usuarioId };
            if (soloNoLeidas) {
                filtro.leida = false;
            }
            const notificaciones = await notificacion_model_1.NotificacionModel.find(filtro)
                .sort({ fechaCreacion: -1 })
                .limit(50)
                .lean();
            return {
                success: true,
                data: notificaciones
            };
        }
        catch (error) {
            console.error('Error obteniendo notificaciones:', error);
            return {
                success: false,
                error: 'Error interno al obtener notificaciones'
            };
        }
    }
    // Marcar notificación como leída
    static async marcarComoLeida(notificacionId, usuarioId) {
        try {
            const resultado = await notificacion_model_1.NotificacionModel.findOneAndUpdate({
                idNotificacion: notificacionId,
                usuarioDestino: usuarioId,
                leida: false
            }, {
                $set: {
                    leida: true,
                    fechaLeida: new Date()
                }
            });
            if (!resultado) {
                return {
                    success: false,
                    error: 'Notificación no encontrada o ya leída'
                };
            }
            return { success: true };
        }
        catch (error) {
            console.error('Error marcando notificación como leída:', error);
            return {
                success: false,
                error: 'Error interno al actualizar notificación'
            };
        }
    }
    // Marcar todas las notificaciones como leídas
    static async marcarTodasComoLeidas(usuarioId) {
        try {
            await notificacion_model_1.NotificacionModel.updateMany({
                usuarioDestino: usuarioId,
                leida: false
            }, {
                $set: {
                    leida: true,
                    fechaLeida: new Date()
                }
            });
            return { success: true };
        }
        catch (error) {
            console.error('Error marcando todas las notificaciones como leídas:', error);
            return {
                success: false,
                error: 'Error interno al actualizar notificaciones'
            };
        }
    }
    // Contar notificaciones no leídas
    static async contarNoLeidas(usuarioId) {
        try {
            const cantidad = await notificacion_model_1.NotificacionModel.countDocuments({
                usuarioDestino: usuarioId,
                leida: false
            });
            return {
                success: true,
                data: cantidad
            };
        }
        catch (error) {
            console.error('Error contando notificaciones no leídas:', error);
            return {
                success: false,
                error: 'Error interno al contar notificaciones'
            };
        }
    }
}
exports.NotificacionService = NotificacionService;
