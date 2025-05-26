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
    static async actualizarDatosUsuario(id, datosActualizados, permitirCambioDeRol = false) {
        if (!id) {
            return {
                success: false,
                error: "Se requiere ID de usuario",
                code: 400,
            };
        }
        try {
            // Obtener usuario actual para saber el rol anterior
            const usuarioExistente = await persona_model_1.PersonaModel.findOne({ idPersona: id }).lean();
            if (!usuarioExistente) {
                return { success: false, error: "Usuario no encontrado", code: 404 };
            }
            // Bloquear cambio de rol si no permitido
            if (!permitirCambioDeRol && "rol" in datosActualizados) {
                delete datosActualizados.rol;
            }
            // Si se cambia el rol, validar campos del nuevo rol
            if (permitirCambioDeRol && datosActualizados.rol && datosActualizados.rol !== usuarioExistente.rol) {
                // Aquí validamos con Zod el objeto completo con nuevo rol y los campos necesarios
                const validacionRol = usuario_types_1.UsuarioSchema.safeParse({
                    ...usuarioExistente, // datos viejos
                    ...datosActualizados, // nuevos datos que incluyen el rol nuevo
                });
                if (!validacionRol.success) {
                    return {
                        success: false,
                        error: "Datos inválidos para el nuevo rol",
                        validationErrors: validacionRol.error.errors,
                        code: 400,
                    };
                }
                // Limpiar campos del rol anterior que ya no corresponden
                const updatesCleaned = { ...datosActualizados };
                if (usuarioExistente.rol === "microempresario") {
                    delete updatesCleaned.nit;
                    delete updatesCleaned.nombreEmpresa;
                }
                if (usuarioExistente.rol === "vendedor") {
                    delete updatesCleaned.codigoVendedor;
                    delete updatesCleaned.ventasRealizadas;
                }
                if (usuarioExistente.rol === "usuario") {
                    // No tiene campos extras, nada que limpiar
                }
                // Aplicar actualización con datos limpios + nuevos campos para nuevo rol
                const resultado = await persona_model_1.PersonaModel.findOneAndUpdate({ idPersona: id }, {
                    $set: {
                        ...updatesCleaned,
                        ...validacionRol.data, // los campos para el nuevo rol
                    },
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
                    data: (() => {
                        if (resultado) {
                            const { password, ...rest } = resultado;
                            return rest;
                        }
                        return undefined;
                    })(),
                };
            }
            else {
                // Caso común sin cambio de rol: validar solo los datos recibidos
                const normalizado = {
                    ...datosActualizados,
                    ...(datosActualizados.edad && { edad: Number(datosActualizados.edad) }),
                    ...(datosActualizados.identificacion && {
                        identificacion: Number(datosActualizados.identificacion),
                    }),
                };
                const safeResult = usuario_types_1.UsuarioSchema.safeParse(normalizado); // .partial() para permitir actualización parcial
                if (!safeResult.success) {
                    return {
                        success: false,
                        error: "Datos inválidos",
                        validationErrors: safeResult.error.errors,
                        code: 400,
                    };
                }
                const updatedUser = await persona_model_1.PersonaModel.findOneAndUpdate({ idPersona: id }, {
                    $set: safeResult.data,
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
                    data: updatedUser,
                };
            }
        }
        catch (error) {
            console.error(`Error actualizando usuario ${id}:`, error);
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
