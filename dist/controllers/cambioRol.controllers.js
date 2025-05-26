"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudCambioRolController = void 0;
const cambioRol_service_1 = require("../services/cambioRol.service");
class SolicitudCambioRolController {
    // Para que el usuario cree una solicitud de cambio de rol
    static async crearSolicitud(req, res) {
        try {
            const usuarioId = req.user?.id; // ✅ Accede correctamente al ID
            const { rolSolicitado, motivoSolicitud, datosAdicionales } = req.body;
            if (!usuarioId) {
                res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado",
                });
                return;
            }
            const rolesPermitidos = ['vendedor', 'microempresario'];
            if (!rolesPermitidos.includes(rolSolicitado)) {
                res.status(400).json({
                    success: false,
                    message: 'Rol solicitado no válido. Solo se puede solicitar: vendedor, microempresario',
                    requestData: req.body
                });
                return;
            }
            // Validar datos adicionales según el rol
            if (rolSolicitado === 'microempresario') {
                if (!datosAdicionales?.nit || !datosAdicionales?.nombreEmpresa) {
                    res.status(400).json({
                        success: false,
                        message: 'Para microempresario se requiere NIT y nombre de empresa',
                        requestData: req.body
                    });
                    return;
                }
            }
            if (rolSolicitado === 'vendedor') {
                if (!datosAdicionales?.experienciaVentas) {
                    res.status(400).json({
                        success: false,
                        message: 'Para vendedor se requiere descripción de experiencia en ventas',
                        requestData: req.body
                    });
                    return;
                }
            }
            const resultado = await cambioRol_service_1.SolicitudCambioRolService.crearSolicitudCambioRol(usuarioId, { rolSolicitado, motivoSolicitud, datosAdicionales });
            if (!resultado.success) {
                res.status(400).json({
                    success: false,
                    message: resultado.error,
                    requestData: req.body
                });
                return;
            }
            res.status(201).json({
                success: true,
                message: 'Solicitud de cambio de rol creada exitosamente',
                data: resultado.data
            });
        }
        catch (error) {
            console.error('Error en crearSolicitud:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                requestData: req.body
            });
        }
    }
    // Para que el usuario vea sus propias solicitudes
    static async obtenerMisSolicitudes(req, res) {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado",
                });
                return;
            }
            const resultado = await cambioRol_service_1.SolicitudCambioRolService.obtenerSolicitudesUsuario(usuarioId);
            if (!resultado.success) {
                res.status(500).json({
                    success: false,
                    message: resultado.error
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Solicitudes obtenidas exitosamente',
                data: resultado.data
            });
        }
        catch (error) {
            console.error('Error en obtenerMisSolicitudes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    // Para administradores: ver solicitudes pendientes
    static async obtenerSolicitudesPendientes(req, res) {
        try {
            // Verificar que sea administrador
            if (req.user?.rol !== 'administrador') {
                res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Solo administradores pueden ver solicitudes pendientes'
                });
                return;
            }
            const resultado = await cambioRol_service_1.SolicitudCambioRolService.obtenerSolicitudesPendientesDetalladas();
            if (!resultado.success) {
                res.status(500).json({
                    success: false,
                    message: resultado.error
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Solicitudes pendientes obtenidas exitosamente',
                data: resultado.data,
                total: resultado.data?.length || 0
            });
        }
        catch (error) {
            console.error('Error en obtenerSolicitudesPendientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    // Para administradores: aprobar o rechazar solicitud
    static async responderSolicitud(req, res) {
        try {
            // Verificar que sea administrador
            if (req.user?.rol !== 'administrador') {
                res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Solo administradores pueden responder solicitudes'
                });
                return;
            }
            const { solicitudId } = req.params;
            const { decision, comentario } = req.body;
            const adminId = req.user?.id;
            // Validaciones
            if (!decision || !['aprobada', 'rechazada'].includes(decision)) {
                res.status(400).json({
                    success: false,
                    message: 'Decisión debe ser "aprobada" o "rechazada"',
                    requestData: req.body
                });
                return;
            }
            if (decision === 'rechazada' && !comentario) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere comentario al rechazar una solicitud',
                    requestData: req.body
                });
                return;
            }
            const resultado = await cambioRol_service_1.SolicitudCambioRolService.responderSolicitud(solicitudId, adminId, { decision, comentario });
            if (!resultado.success) {
                res.status(400).json({
                    success: false,
                    message: resultado.error,
                    requestData: req.body
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: resultado.data?.mensaje || 'Solicitud procesada exitosamente',
                data: resultado.data
            });
        }
        catch (error) {
            console.error('Error en responderSolicitud:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                requestData: req.body
            });
        }
    }
}
exports.SolicitudCambioRolController = SolicitudCambioRolController;
