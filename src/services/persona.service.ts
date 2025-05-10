import { PersonaModel } from "../models/persona/persona.model";
import { hashPassword } from "../utils/auth.utils";
import { IUsuario, UsuarioSchema } from "../types/usuario.types";
import { generateToken } from "../middlewares/generateToken";

export class PersonaService {
  public static async registerUsuario(
    usuarioData: any,
    rolParam?: string
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    validationErrors?: any[];
  }> {
    try {
      console.log(rolParam);
      const validatedData = UsuarioSchema.parse({
        ...usuarioData,
        rol: rolParam ?? "usuario",
        edad: Number(usuarioData.edad),
        identificacion: Number(usuarioData.identificacion),
      });

      // Verificar si el usuario ya existe
      const usuarioExistenteCorreo = await PersonaModel.findOne({
        correo: validatedData.correo,
      });

      const usuarioExistenteId = await PersonaModel.findOne({
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
      const nuevoUsuario = new PersonaModel({
        ...validatedData,
        password: await hashPassword(validatedData.password),
        fechaCreacionPersona: new Date(),
      });

      // Guardar en la base de datos
      const savedUsuario = await nuevoUsuario.save();
      const token = generateToken(
        savedUsuario.idPersona.toString(),
        savedUsuario.rol
      );

      // Preparar respuesta sin password
      const usuarioResponse = savedUsuario.toObject();
      delete (usuarioResponse as any).password;

      return {
        success: true,
        data: {
          usuarioResponse,
          token,
        },
      };
    } catch (error) {
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
  public static async actualizarDatosUsuario(
    id: string,
    datosActualizados: Partial<IUsuario>,
    permitirCambioDeRol = false
  ): Promise<{
    success: boolean;
    data?: Omit<IUsuario, "password">;
    error?: string;
    code?: number;
  }> {
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
      const normalizado: any = {
        ...datosActualizados,
        ...(datosActualizados.edad && { edad: Number(datosActualizados.edad) }),
        ...(datosActualizados.identificacion && {
          identificacion: Number(datosActualizados.identificacion),
        }),
      };

      //  Validar datos actualizables
      const updatesToApply = UsuarioSchema.partial().parse(normalizado);
      const updatePayload: Partial<IUsuario> = { ...updatesToApply };

      //  Bloquear cambio de rol si no está permitido
      if (!permitirCambioDeRol) {
        delete updatePayload.rol;
      }

      const updatedUser = await PersonaModel.findOneAndUpdate(
        { idPersona: id },
        {
          $set: updatePayload,
          $currentDate: { fechaActualizacionPersona: true },
        },
        {
          new: true,
          runValidators: true,
          select: "-password -__v",
        }
      ).lean();

      if (!updatedUser) {
        return {
          success: false,
          error: "Error al actualizar usuario",
          code: 500,
        };
      }

      return {
        success: true,
        data: updatedUser as Omit<IUsuario, "password">,
      };
    } catch (error) {
      console.error(`Error actualizando usuario ${id}:`, error);
      return {
        success: false,
        error: "Error interno al actualizar usuario",
        code: 500,
      };
    }
  }

  public static async obtenerUsuarioPorId(idPersona: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const usuario = await PersonaModel.findOne({ idPersona });
      
      if (!usuario) {
        return {
          success: false,
          error: "Usuario no encontrado",
        };
      }

      const usuarioResponse = usuario.toObject();
      delete (usuarioResponse as any).password;

      return {
        success: true,
        data: usuarioResponse,
      };
    } catch (error) {
      console.error("Error al obtener usuario por ID:", error);
      return {
        success: false,
        error: "Error interno al obtener el usuario",
      };
    }
  }
}
