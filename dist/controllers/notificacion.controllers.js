"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacionController = void 0;
const notificacion_service_1 = require("../services/notificacion.service");
class NotificacionController {
    // Obtener notificaciones del usuario autenticado
    static async obtenerMisNotificaciones(req, res) {
        try {
            const usuarioId = req.user?.id;
            const { soloNoLeidas } = req.query;
            if (!usuarioId) {
                res.status(400).json({
                    success: false,
                    message: 'ID de usuario no proporcionado'
                });
                return;
            }
            const resultado = await notificacion_service_1.NotificacionService.obtenerNotificacionesUsuario(usuarioId, soloNoLeidas === 'true');
            if (!resultado.success) {
                res.status(500).json({
                    success: false,
                    message: resultado.error
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Notificaciones obtenidas exitosamente',
                data: resultado.data,
                total: resultado.data?.length || 0
            });
        }
        catch (error) {
            console.error('Error en obtenerMisNotificaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    // Marcar notificación como leída
    static async marcarComoLeida(req, res) {
        try {
            const usuarioId = req.user?.id;
            const { notificacionId } = req.params;
            if (!usuarioId || !notificacionId) {
                res.status(400).json({
                    success: false,
                    message: 'ID de usuario o ID de notificación no proporcionado'
                });
                return;
            }
            const resultado = await notificacion_service_1.NotificacionService.marcarComoLeida(notificacionId, usuarioId);
            if (!resultado.success) {
                res.status(400).json({
                    success: false,
                    message: resultado.error
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Notificación marcada como leída'
            });
        }
        catch (error) {
            console.error('Error en marcarComoLeida:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    // Marcar todas las notificaciones como leídas
    static async marcarTodasComoLeidas(req, res) {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(400).json({
                    success: false,
                    message: 'ID de usuario no proporcionado'
                });
                return;
            }
            const resultado = await notificacion_service_1.NotificacionService.marcarTodasComoLeidas(usuarioId);
            if (!resultado.success) {
                res.status(500).json({
                    success: false,
                    message: resultado.error
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Todas las notificaciones marcadas como leídas'
            });
        }
        catch (error) {
            console.error('Error en marcarTodasComoLeidas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    // Contar notificaciones no leídas
    static async contarNoLeidas(req, res) {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(400).json({
                    success: false,
                    message: 'ID de usuario no proporcionado'
                });
                return;
            }
            const resultado = await notificacion_service_1.NotificacionService.contarNoLeidas(usuarioId);
            if (!resultado.success) {
                res.status(500).json({
                    success: false,
                    message: resultado.error
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Conteo obtenido exitosamente',
                data: {
                    notificacionesNoLeidas: resultado.data
                }
            });
        }
        catch (error) {
            console.error('Error en contarNoLeidas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    // Para administradores: crear notificación general
    static async crearNotificacionGeneral(req, res) {
        try {
            // Verificar que sea administrador
            if (req.user?.rol !== 'administrador') {
                res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Solo administradores pueden crear notificaciones generales'
                });
                return;
            }
            const { usuarioDestino, titulo, mensaje } = req.body;
            if (!usuarioDestino || !titulo || !mensaje) {
                res.status(400).json({
                    success: false,
                    message: 'Usuario destino, título y mensaje son obligatorios',
                    requestData: req.body
                });
                return;
            }
            const resultado = await notificacion_service_1.NotificacionService.crearNotificacion({
                usuarioDestino,
                tipoNotificacion: 'general',
                titulo,
                mensaje
            });
            if (!resultado.success) {
                res.status(500).json({
                    success: false,
                    message: resultado.error,
                    requestData: req.body
                });
                return;
            }
            res.status(201).json({
                success: true,
                message: 'Notificación creada exitosamente',
                data: resultado.data
            });
        }
        catch (error) {
            console.error('Error en crearNotificacionGeneral:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                requestData: req.body
            });
        }
    }
}
exports.NotificacionController = NotificacionController;
