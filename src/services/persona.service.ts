import { PersonaModel } from "../models/persona/persona.model";
import { comparePasswords, hashPassword } from "../utils/auth.utils";
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

  public static async cambiarContrasena(
    idUsuario: string,
    datosCambio: {
      contrasenaActual: string;
      nuevaContrasena: string;
      confirmacionNuevaContrasena: string;
    }
  ): Promise<{
    success: boolean;
    data?: Omit<IUsuario, "password">;
    error?: string;
    code?: number;
    validationErrors?: { path: string; message: string }[];
  }> {
    // 1. Validación básica del ID
    if (!idUsuario) {
      return { success: false, error: "ID de usuario inválido", code: 400 };
    }

    try {
      // 2. Validaciones de contraseña (igual que antes)
      if (
        datosCambio.nuevaContrasena !== datosCambio.confirmacionNuevaContrasena
      ) {
        return {
          success: false,
          error: "La nueva contraseña y su confirmación no coinciden",
          code: 400,
        };
      }

      // 3. Obtener usuario con contraseña
      const usuario = await PersonaModel.findOne({
        idPersona: idUsuario,
      }).select("+password");

      if (!usuario) {
        return { success: false, error: "Usuario no encontrado", code: 404 };
      }

      // 4. Verificar contraseña actual
      const esContrasenaValida = await comparePasswords(
        datosCambio.contrasenaActual,
        usuario.password
      );

      if (!esContrasenaValida) {
        return {
          success: false,
          error: "Contraseña actual incorrecta",
          code: 401,
        };
      }

      // 5. Hashear nueva contraseña
      const nuevaContrasenaHash = await hashPassword(
        datosCambio.nuevaContrasena
      );

      // 6. Actualizar contraseña usando el _id real del documento
      const usuarioActualizado = await PersonaModel.findOneAndUpdate(
        { _id: usuario._id }, // Usamos el _id del documento encontrado
        {
          $set: { password: nuevaContrasenaHash },
          $currentDate: { fechaActualizacionPersona: true },
        },
        {
          new: true,
          select: "-password -__v -fechaCreacionPersona",
          lean: true,
        }
      );

      if (!usuarioActualizado) {
        return {
          success: false,
          error: "Error al actualizar contraseña",
          code: 500,
        };
      }

      return {
        success: true,
        data: usuarioActualizado as Omit<IUsuario, "password">,
      };
    } catch (error) {
      console.error(
        `Error cambiando contraseña para usuario ${idUsuario}:`,
        error
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error interno al cambiar contraseña",
        code: 500,
      };
    }
  }

  public static async getUsuarios(): Promise<any> {
    try {
      const respuesta = await PersonaModel.find().lean();

      if (!respuesta || respuesta.length === 0) {
        return {
          success: false,
          error: "No hay usuarios registrados",
        };
      }

      // Eliminar campos innecesarios como 'password' y '__v' antes de devolver los usuarios
      const usuarios = respuesta.map((user) => {
        const { password, __v, ...rest } = user;
        return rest;
      });

      return {
        success: true,
        data: usuarios,
      };
    } catch (error) {
      console.error("Error en el servicio de usuarios:", error);
      return {
        success: false,
        error: "Error al obtener usuarios",
      };
    }
  }
}
