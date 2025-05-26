"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudCambioRolService = void 0;
const cambioRol_model_1 = require("../models/cambioRol.model");
const notificacion_service_1 = require("../services/notificacion.service");
const persona_service_1 = require("./persona.service");
const persona_model_1 = require("../models/persona.model");
class SolicitudCambioRolService {
    // Crear nueva solicitud de cambio de rol
    static async crearSolicitudCambioRol(usuarioId, datosSolicitud) {
        try {
            // Verificar que el usuario existe
            const usuarioExistente = await persona_service_1.PersonaService.obtenerUsuarioPorId(usuarioId);
            if (!usuarioExistente.success) {
                return {
                    success: false,
                    error: "Usuario no encontrado",
                };
            }
            // Verificar que no tenga solicitudes pendientes
            const solicitudPendiente = await cambioRol_model_1.SolicitudCambioRolModel.findOne({
                usuarioSolicitante: usuarioId,
                estadoSolicitud: "pendiente",
            });
            if (solicitudPendiente) {
                return {
                    success: false,
                    error: "Ya tienes una solicitud de cambio de rol pendiente",
                };
            }
            // Generar ID único para la solicitud
            const idSolicitud = `SOL-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`;
            // Crear la solicitud
            const nuevaSolicitud = new cambioRol_model_1.SolicitudCambioRolModel({
                idSolicitud,
                usuarioSolicitante: usuarioId,
                rolActual: usuarioExistente.data.rol,
                rolSolicitado: datosSolicitud.rolSolicitado,
                motivoSolicitud: datosSolicitud.motivoSolicitud,
                datosAdicionales: datosSolicitud.datosAdicionales,
            });
            const solicitudGuardada = await nuevaSolicitud.save();
            // Crear notificación para administradores
            await notificacion_service_1.NotificacionService.notificarAdministradores({
                tipoNotificacion: "solicitud_cambio_rol",
                titulo: "Nueva solicitud de cambio de rol",
                mensaje: `El usuario ${usuarioExistente.data.nombrePersona} ha solicitado cambiar de ${usuarioExistente.data.rol} a ${datosSolicitud.rolSolicitado}`,
                referenciaDocumento: solicitudGuardada.idSolicitud,
            });
            return {
                success: true,
                data: solicitudGuardada,
            };
        }
        catch (error) {
            console.error("Error creando solicitud de cambio de rol:", error);
            return {
                success: false,
                error: "Error interno al crear la solicitud",
            };
        }
    }
    // Obtener solicitudes pendientes (para administradores) - FIXED
    static async obtenerSolicitudesPendientes() {
        try {
            const solicitudes = await cambioRol_model_1.SolicitudCambioRolModel.find({
                estadoSolicitud: "pendiente",
            })
                .populate("usuarioSolicitante", "nombrePerson")
                .sort({ fechaSolicitud: -1 });
            return {
                success: true,
                data: solicitudes,
            };
        }
        catch (error) {
            console.error("Error obteniendo solicitudes pendientes:", error);
            return {
                success: false,
                error: "Error interno al obtener solicitudes",
            };
        }
    }
    // Obtener solicitudes pendientes con información detallada del usuario - MEJORADO
    static async obtenerSolicitudesPendientesDetalladas() {
        try {
            // Obtener las solicitudes pendientes sin populate
            const solicitudes = await cambioRol_model_1.SolicitudCambioRolModel.find({
                estadoSolicitud: "pendiente",
            })
                .sort({ fechaSolicitud: -1 })
                .lean();
            // Crear un mapa de usuarios únicos para evitar consultas repetidas
            const usuariosIds = [
                ...new Set(solicitudes.map((s) => s.usuarioSolicitante)),
            ];
            // Obtener todos los usuarios de una vez usando Promise.all
            const usuarios = await Promise.all(usuariosIds.map(async (usuarioId) => {
                const usuario = await persona_service_1.PersonaService.obtenerUsuarioPorId(usuarioId.toString());
                return {
                    id: usuarioId,
                    datos: usuario.success ? usuario.data : null,
                };
            }));
            // Crear un mapa para acceso rápido a los datos del usuario
            const usuariosMap = new Map();
            usuarios.forEach((u) => {
                if (u.datos) {
                    usuariosMap.set(u.id.toString(), u.datos);
                }
            });
            // Formatear las solicitudes con los datos del usuario
            const solicitudesFormateadas = solicitudes.map((solicitud) => {
                const usuarioData = usuariosMap.get(solicitud.usuarioSolicitante.toString());
                return {
                    ...solicitud,
                    usuarioSolicitante: {
                        idPersona: usuarioData.idPersona,
                        nombre: `${usuarioData.nombrePersona} ${usuarioData.apellido}`,
                    },
                };
            });
            return {
                success: true,
                data: solicitudesFormateadas,
                total: solicitudesFormateadas.length,
            };
        }
        catch (error) {
            console.error("Error obteniendo solicitudes pendientes detalladas:", error);
            return {
                success: false,
                error: "Error interno al obtener solicitudes",
            };
        }
    }
    // Alternativa usando PersonaModel directamente (más eficiente)
    static async obtenerSolicitudesPendientesDetalladasOptimizada() {
        try {
            // Obtener las solicitudes pendientes
            const solicitudes = await cambioRol_model_1.SolicitudCambioRolModel.find({
                estadoSolicitud: "pendiente",
            })
                .sort({ fechaSolicitud: -1 })
                .lean();
            // Extraer IDs únicos de usuarios
            const usuariosIds = [
                ...new Set(solicitudes.map((s) => s.usuarioSolicitante)),
            ];
            // Obtener todos los usuarios de una vez usando PersonaModel directamente
            const usuarios = await persona_model_1.PersonaModel.find({
                idPersona: { $in: usuariosIds },
            })
                .select("idPersona nombrePersona apellido correo identificacion rol telefono ciudad")
                .lean();
            // Crear mapa para acceso rápido
            const usuariosMap = new Map();
            usuarios.forEach((usuario) => {
                usuariosMap.set(usuario.idPersona.toString(), usuario);
            });
            // Formatear solicitudes con datos del usuario
            const solicitudesFormateadas = solicitudes.map((solicitud) => {
                const usuarioData = usuariosMap.get(solicitud.usuarioSolicitante.toString());
                return {
                    ...solicitud,
                    usuarioInfo: usuarioData
                        ? {
                            nombre: `${usuarioData.nombrePersona} ${usuarioData.apellido}`,
                            correo: usuarioData.correo,
                            identificacion: usuarioData.identificacion,
                            rolActual: usuarioData.rol,
                            telefono: usuarioData.telefono || null,
                            ciudad: usuarioData.ciudad || null,
                        }
                        : {
                            nombre: "Usuario no encontrado",
                            correo: "N/A",
                            identificacion: "N/A",
                            rolActual: "N/A",
                            telefono: null,
                            ciudad: null,
                        },
                };
            });
            return {
                success: true,
                data: solicitudesFormateadas,
                total: solicitudesFormateadas.length,
            };
        }
        catch (error) {
            console.error("Error obteniendo solicitudes pendientes detalladas:", error);
            return {
                success: false,
                error: "Error interno al obtener solicitudes",
            };
        }
    }
    // Responder a una solicitud (aprobar/rechazar)
    static async responderSolicitud(solicitudId, adminId, respuesta) {
        try {
            const solicitud = await cambioRol_model_1.SolicitudCambioRolModel.findOne({
                idSolicitud: solicitudId,
                estadoSolicitud: "pendiente",
            }).populate("usuarioSolicitante");
            if (!solicitud) {
                return {
                    success: false,
                    error: "Solicitud no encontrada o ya procesada",
                };
            }
            // Actualizar la solicitud
            solicitud.estadoSolicitud = respuesta.decision;
            solicitud.fechaRespuesta = new Date();
            solicitud.administradorQueResponde = adminId;
            solicitud.comentarioAdmin = respuesta.comentario;
            await solicitud.save();
            // Si fue aprobada, actualizar el rol del usuario
            if (respuesta.decision === "aprobada") {
                const datosActualizacion = {
                    rol: solicitud.rolSolicitado,
                };
                // Agregar datos específicos del rol si existen
                if (solicitud.datosAdicionales) {
                    if (solicitud.rolSolicitado === "microempresario") {
                        datosActualizacion.nit = solicitud.datosAdicionales.nit;
                        datosActualizacion.nombreEmpresa =
                            solicitud.datosAdicionales.nombreEmpresa;
                    }
                    else if (solicitud.rolSolicitado === "vendedor") {
                        datosActualizacion.codigoVendedor =
                            solicitud.datosAdicionales.codigoVendedor;
                        datosActualizacion.ventasRealizadas = 0;
                    }
                }
                // Usar el ObjectId correcto para la actualización
                const usuarioId = solicitud.usuarioSolicitante.idPersona ||
                    solicitud.usuarioSolicitante.idPersona;
                await persona_service_1.PersonaService.actualizarDatosUsuario(usuarioId.toString(), datosActualizacion, true // Permitir cambio de rol
                );
            }
            // Notificar al usuario sobre la respuesta
            const usuarioId = solicitud.usuarioSolicitante.idPersona ||
                solicitud.usuarioSolicitante.idPersona;
            await notificacion_service_1.NotificacionService.crearNotificacion({
                usuarioDestino: usuarioId.toString(),
                tipoNotificacion: "respuesta_solicitud",
                titulo: `Solicitud de cambio de rol ${respuesta.decision}`,
                mensaje: respuesta.decision === "aprobada"
                    ? `¡Felicidades! Tu solicitud para cambiar a ${solicitud.rolSolicitado} ha sido aprobada.`
                    : `Tu solicitud para cambiar a ${solicitud.rolSolicitado} ha sido rechazada. ${respuesta.comentario || ""}`,
                referenciaDocumento: solicitudId,
            });
            return {
                success: true,
                data: {
                    solicitud,
                    mensaje: `Solicitud ${respuesta.decision} exitosamente`,
                },
            };
        }
        catch (error) {
            console.error("Error respondiendo solicitud:", error);
            return {
                success: false,
                error: "Error interno al procesar la respuesta",
            };
        }
    }
    // Obtener solicitudes de un usuario específico
    static async obtenerSolicitudesUsuario(usuarioId) {
        try {
            // Buscar solicitudes del usuario
            const solicitudes = await cambioRol_model_1.SolicitudCambioRolModel.find({
                usuarioSolicitante: usuarioId,
            })
                .sort({ fechaSolicitud: -1 })
                .lean();
            if (solicitudes.length === 0) {
                return { success: true, data: [] };
            }
            // Obtener el usuario (solo uno, porque es un usuarioId específico)
            const usuarioData = await persona_model_1.PersonaModel.findOne({
                idPersona: usuarioId,
            })
                .select("idPersona nombrePersona apellido correo identificacion")
                .lean();
            console.log(usuarioData);
            // Formatear las solicitudes con los datos del usuario
            const solicitudesFormateadas = solicitudes.map((solicitud) => ({
                ...solicitud,
                usuarioSolicitante: usuarioData
                    ? {
                        idPersona: usuarioData.idPersona,
                        nombre: `${usuarioData.nombrePersona} ${usuarioData.apellido}`,
                    }
                    : {
                        idPersona: "N/A",
                        nombre: "Usuario no encontrado",
                    },
            }));
            return {
                success: true,
                data: solicitudesFormateadas,
            };
        }
        catch (error) {
            console.error("Error obteniendo solicitudes del usuario:", error);
            return {
                success: false,
                error: "Error interno al obtener solicitudes",
            };
        }
    }
    // Cancelar solicitud pendiente (para usuarios)
    static async cancelarSolicitud(solicitudId, usuarioId) {
        try {
            const solicitud = await cambioRol_model_1.SolicitudCambioRolModel.findOne({
                idSolicitud: solicitudId,
                usuarioSolicitante: usuarioId,
                estadoSolicitud: "pendiente",
            });
            if (!solicitud) {
                return {
                    success: false,
                    error: "Solicitud no encontrada o no puedes cancelarla",
                };
            }
            await cambioRol_model_1.SolicitudCambioRolModel.deleteOne({ _id: solicitud._id });
            return {
                success: true,
                message: "Solicitud cancelada exitosamente",
            };
        }
        catch (error) {
            console.error("Error cancelando solicitud:", error);
            return {
                success: false,
                error: "Error interno al cancelar la solicitud",
            };
        }
    }
    // Obtener estadísticas de solicitudes
    static async obtenerEstadisticasSolicitudes() {
        try {
            const estadisticas = await cambioRol_model_1.SolicitudCambioRolModel.aggregate([
                {
                    $group: {
                        _id: "$estadoSolicitud",
                        total: { $sum: 1 },
                    },
                },
            ]);
            const estadisticasPorRol = await cambioRol_model_1.SolicitudCambioRolModel.aggregate([
                {
                    $group: {
                        _id: "$rolSolicitado",
                        total: { $sum: 1 },
                    },
                },
            ]);
            return {
                success: true,
                data: {
                    porEstado: estadisticas,
                    porRolSolicitado: estadisticasPorRol,
                },
            };
        }
        catch (error) {
            console.error("Error obteniendo estadísticas:", error);
            return {
                success: false,
                error: "Error interno al obtener estadísticas",
            };
        }
    }
}
exports.SolicitudCambioRolService = SolicitudCambioRolService;
