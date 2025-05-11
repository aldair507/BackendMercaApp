"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaService = void 0;
const persona_model_1 = require("../models/persona/persona.model");
const auth_utils_1 = require("../utils/auth.utils");
const usuario_types_1 = require("../types/usuario.types");
const generateToken_1 = require("../middlewares/generateToken");
class PersonaService {
    static async registerUsuario(usuarioData, rolParam) {
        try {
            console.log(rolParam);
            const validatedData = usuario_types_1.UsuarioSchema.parse({
                ...usuarioData,
                rol: rolParam ?? "usuario",
                edad: Number(usuarioData.edad),
                identificacion: Number(usuarioData.identificacion),
            });
            // Verificar si el usuario ya existe
            const usuarioExistenteCorreo = await persona_model_1.PersonaModel.findOne({
                correo: validatedData.correo,
            });
            const usuarioExistenteId = await persona_model_1.PersonaModel.findOne({
                identificacion: validatedData.identificacion,
            });
            if (usuarioExistenteCorreo) {
                return {
                    success: false,
                    error: "El correo electrónico ya está registrado",
                };
            }
            if (usuarioExistenteId) {
                return {
                    success: false,
                    error: "La identificación ya está registrada",
                };
            }
            // Crear nuevo usuario
            const nuevoUsuario = new persona_model_1.PersonaModel({
                ...validatedData,
                password: await (0, auth_utils_1.hashPassword)(validatedData.password),
                fechaCreacionPersona: new Date(),
            });
            // Guardar en la base de datos
            const savedUsuario = await nuevoUsuario.save();
            const token = (0, generateToken_1.generateToken)(savedUsuario.idPersona.toString(), savedUsuario.rol);
            // Preparar respuesta sin password
            const usuarioResponse = savedUsuario.toObject();
            delete usuarioResponse.password;
            return {
                success: true,
                data: {
                    usuarioResponse,
                    token,
                },
            };
        }
        catch (error) {
            console.error("Error en PersonaService.registerUsuario:", error);
            if (error instanceof Error && "errors" in error) {
                return {
                    success: false,
                    error: "Error de validación",
                };
            }
            return {
                success: false,
                error: "Error interno al registrar el usuario",
            };
        }
    }
    static async actualizarDatosUsuario(id, datosActualizados, permitirCambioDeRol = false) {
        //  Validación temprana
        if (!id) {
            return {
                success: false,
                error: "Se requiere ID de usuario",
                code: 400,
            };
        }
        try {
            //  Buscar usuario por idPersona
            const usuarioExistente = await this.obtenerUsuarioPorId(id);
            if (!usuarioExistente.success) {
                return {
                    success: false,
                    error: usuarioExistente.error || "Usuario no encontrado",
                    code: 404,
                };
            }
            // Convertir datos numéricos si existen
            const normalizado = {
                ...datosActualizados,
                ...(datosActualizados.edad && { edad: Number(datosActualizados.edad) }),
                ...(datosActualizados.identificacion && {
                    identificacion: Number(datosActualizados.identificacion),
                }),
            };
            //  Validar datos actualizables
            const updatesToApply = usuario_types_1.UsuarioSchema.partial().parse(normalizado);
            const updatePayload = { ...updatesToApply };
            //  Bloquear cambio de rol si no está permitido
            if (!permitirCambioDeRol) {
                delete updatePayload.rol;
            }
            const updatedUser = await persona_model_1.PersonaModel.findOneAndUpdate({ idPersona: id }, {
                $set: updatePayload,
                $currentDate: { fechaActualizacionPersona: true },
            }, {
                new: true,
                runValidators: true,
                select: "-password -__v",
            }).lean();
            if (!updatedUser) {
                return {
                    success: false,
                    error: "Error al actualizar usuario",
                    code: 500,
                };
            }
            return {
                success: true,
                data: updatedUser,
            };
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
}
exports.PersonaService = PersonaService;
