"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaService = void 0;
const persona_model_1 = require("../models/persona.model");
const auth_utils_1 = require("../utils/auth.utils");
const usuario_types_1 = require("../types/usuario.types");
const generateToken_1 = require("../middlewares/generateToken");
class PersonaService {
    static async registerUsuario(usuarioData, rolParam) {
        try {
            // Asignar rol (por parámetro o por defecto)
            usuarioData.rol = rolParam ?? "usuario";
            // Validar con Zod (normalizando edad e identificación)
            const validatedData = usuario_types_1.UsuarioSchema.parse({
                ...usuarioData,
                edad: Number(usuarioData.edad),
                identificacion: Number(usuarioData.identificacion),
            });
            // Validar si ya existe correo o identificación
            const usuarioExistenteCorreo = await persona_model_1.PersonaModel.findOne({
                correo: validatedData.correo,
            });
            if (usuarioExistenteCorreo) {
                return {
                    success: false,
                    error: "El correo electrónico ya está registrado",
                };
            }
            const usuarioExistenteId = await persona_model_1.PersonaModel.findOne({
                identificacion: validatedData.identificacion,
            });
            if (usuarioExistenteId) {
                return {
                    success: false,
                    error: "La identificación ya está registrada",
                };
            }
            // Crear nuevo usuario
            const nuevoUsuario = new persona_model_1.PersonaModel({
                ...validatedData,
                estadoPersona: validatedData.estadoPersona ?? true,
                password: await (0, auth_utils_1.hashPassword)(validatedData.password),
                fechaCreacionPersona: new Date(),
                ...(validatedData.rol === "microempresario" && {
                    nit: validatedData.nit,
                    nombreEmpresa: validatedData.nombreEmpresa,
                }),
                ...(validatedData.rol === "vendedor" && {
                    codigoVendedor: validatedData.codigoVendedor,
                    ventasRealizadas: validatedData.ventasRealizadas,
                }),
            });
            // Guardar en BD
            const savedUsuario = await nuevoUsuario.save();
            // Generar token
            const token = (0, generateToken_1.generateToken)(savedUsuario.idPersona.toString(), savedUsuario.rol);
            // Preparar respuesta sin password
            const usuarioResponse = savedUsuario.toObject();
            delete usuarioResponse.password;
            return {
                success: true,
                data: {
                    usuario: usuarioResponse,
                    token,
                },
            };
        }
        catch (error) {
            console.error("Error en PersonaService.registerUsuario:", error);
            return {
                success: false,
                error: "Error interno al registrar el usuario",
            };
        }
    }
    static async actualizarDatosUsuario(id, datosActualizados, permitirCambioDeRol = true) {
        if (!id) {
            return {
                success: false,
                error: "Se requiere ID de usuario",
                code: 400,
            };
        }
        try {
            // Buscar usuario actual sin contraseña para validaciones
            const usuarioExistente = await persona_model_1.PersonaModel.findOne({ idPersona: id }).lean();
            if (!usuarioExistente) {
                return { success: false, error: "Usuario no encontrado", code: 404 };
            }
            // Bloquear cambio de rol si no está permitido
            if (!permitirCambioDeRol && "rol" in datosActualizados) {
                delete datosActualizados.rol;
            }
            // Normalizar datos numéricos si están presentes
            const datosNormalizados = { ...datosActualizados };
            if (datosNormalizados.edad !== undefined) {
                datosNormalizados.edad = Number(datosNormalizados.edad);
            }
            if (datosNormalizados.identificacion !== undefined) {
                datosNormalizados.identificacion = Number(datosNormalizados.identificacion);
            }
            // Validar duplicados solo si se están actualizando correo o identificación
            if (datosNormalizados.correo && datosNormalizados.correo !== usuarioExistente.correo) {
                const correoExistente = await persona_model_1.PersonaModel.findOne({
                    correo: datosNormalizados.correo,
                    idPersona: { $ne: id }
                });
                if (correoExistente) {
                    return {
                        success: false,
                        error: "El correo electrónico ya está registrado",
                        code: 400,
                    };
                }
            }
            if (datosNormalizados.identificacion && datosNormalizados.identificacion !== usuarioExistente.identificacion) {
                const identificacionExistente = await persona_model_1.PersonaModel.findOne({
                    identificacion: datosNormalizados.identificacion,
                    idPersona: { $ne: id }
                });
                if (identificacionExistente) {
                    return {
                        success: false,
                        error: "La identificación ya está registrada",
                        code: 400,
                    };
                }
            }
            // Si cambia el rol y está permitido validar campos del nuevo rol
            if (permitirCambioDeRol &&
                datosNormalizados.rol &&
                datosNormalizados.rol !== usuarioExistente.rol) {
                // Combinar datos existentes con los nuevos para validación completa
                const datosCompletos = {
                    ...usuarioExistente,
                    ...datosNormalizados,
                };
                const validacionRol = usuario_types_1.UsuarioSchema.safeParse(datosCompletos);
                if (!validacionRol.success) {
                    return {
                        success: false,
                        error: "Datos inválidos para el nuevo rol",
                        validationErrors: validacionRol.error.errors,
                        code: 400,
                    };
                }
                // Limpiar campos del rol anterior que no corresponden
                const updatesCleaned = { ...datosNormalizados };
                if (usuarioExistente.rol === "microempresario") {
                    delete updatesCleaned.nit;
                    delete updatesCleaned.nombreEmpresa;
                }
                else if (usuarioExistente.rol === "vendedor") {
                    delete updatesCleaned.codigoVendedor;
                    delete updatesCleaned.ventasRealizadas;
                }
                // Actualizar con los datos validados
                const resultado = await persona_model_1.PersonaModel.findOneAndUpdate({ idPersona: id }, {
                    $set: updatesCleaned,
                    $currentDate: { fechaActualizacionPersona: true },
                }, { new: true, runValidators: true, select: "-password -__v" }).lean();
                if (!resultado) {
                    return {
                        success: false,
                        error: "Error actualizando usuario",
                        code: 500,
                    };
                }
                return {
                    success: true,
                    data: {
                        ...resultado,
                        identificacion: Number(resultado.identificacion),
                    },
                };
            }
            else {
                // Caso sin cambio de rol: actualizar directamente sin validación de esquema completo
                // Solo validamos tipos de datos básicos que ya normalizamos arriba
                const updatedUser = await persona_model_1.PersonaModel.findOneAndUpdate({ idPersona: id }, {
                    $set: datosNormalizados,
                    $currentDate: { fechaActualizacionPersona: true },
                }, { new: true, runValidators: true, select: "-password -__v" }).lean();
                if (!updatedUser) {
                    return {
                        success: false,
                        error: "Error actualizando usuario",
                        code: 500,
                    };
                }
                return {
                    success: true,
                    data: {
                        ...updatedUser,
                        identificacion: Number(updatedUser.identificacion),
                    },
                };
            }
        }
        catch (error) {
            console.error(`Error actualizando usuario ${id}:`, error);
            // Manejar errores de validación de MongoDB
            return {
                success: false,
                error: "Error interno al actualizar usuario",
                code: 500,
            };
        }
    }
    static async obtenerUsuarioPorId(idPersona) {
        try {
            const usuario = await persona_model_1.PersonaModel.findOne({ idPersona });
            if (!usuario) {
                return {
                    success: false,
                    error: "Usuario no encontrado",
                };
            }
            const usuarioResponse = usuario.toObject();
            delete usuarioResponse.password;
            return {
                success: true,
                data: usuarioResponse,
            };
        }
        catch (error) {
            console.error("Error al obtener usuario por ID:", error);
            return {
                success: false,
                error: "Error interno al obtener el usuario",
            };
        }
    }
    static async cambiarContrasena(idUsuario, datosCambio) {
        if (!idUsuario) {
            return { success: false, error: "ID de usuario inválido", code: 400 };
        }
        try {
            if (datosCambio.nuevaContrasena !== datosCambio.confirmacionNuevaContrasena) {
                return {
                    success: false,
                    error: "La nueva contraseña y su confirmación no coinciden",
                    code: 400,
                };
            }
            const usuario = await persona_model_1.PersonaModel.findOne({
                idPersona: idUsuario,
            }).select("+password");
            if (!usuario) {
                return { success: false, error: "Usuario no encontrado", code: 404 };
            }
            const esContrasenaValida = await (0, auth_utils_1.comparePasswords)(datosCambio.contrasenaActual, usuario.password);
            if (!esContrasenaValida) {
                return {
                    success: false,
                    error: "Contraseña actual incorrecta",
                    code: 401,
                };
            }
            const nuevaContrasenaHash = await (0, auth_utils_1.hashPassword)(datosCambio.nuevaContrasena);
            const usuarioActualizado = await persona_model_1.PersonaModel.findOneAndUpdate({ _id: usuario._id }, {
                $set: { password: nuevaContrasenaHash },
                $currentDate: { fechaActualizacionPersona: true },
            }, {
                new: true,
                select: "-password -__v -fechaCreacionPersona",
                lean: true,
            });
            if (!usuarioActualizado) {
                return {
                    success: false,
                    error: "Error al actualizar contraseña",
                    code: 500,
                };
            }
            return {
                success: true,
                data: {
                    ...usuarioActualizado,
                    identificacion: Number(usuarioActualizado.identificacion),
                },
            };
        }
        catch (error) {
            console.error(`Error cambiando contraseña para usuario ${idUsuario}:`, error);
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Error interno al cambiar contraseña",
                code: 500,
            };
        }
    }
    static async getUsuarios() {
        try {
            const respuesta = await persona_model_1.PersonaModel.find().lean();
            if (!respuesta || respuesta.length === 0) {
                return {
                    success: false,
                    error: "No hay usuarios registrados",
                };
            }
            const usuarios = respuesta.map((user) => {
                const { password, __v, ...rest } = user;
                return rest;
            });
            return {
                success: true,
                data: usuarios,
            };
        }
        catch (error) {
            console.error("Error en el servicio de usuarios:", error);
            return {
                success: false,
                error: "Error al obtener usuarios",
            };
        }
    }
}
exports.PersonaService = PersonaService;
