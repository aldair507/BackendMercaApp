import { PersonaModel } from "../models/persona/persona.model";
import { comparePasswords, hashPassword } from "../utils/auth.utils";
import { IUsuario, UsuarioSchema } from "../types/usuario.types";
import { generateToken } from "../middlewares/generateToken";
import { IPersona } from "../interfaces/persona.interface";

export class PersonaService {
  public static async registerUsuario(
    usuarioData: Partial<IPersona>,
    rolParam?: string
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    validationErrors?: any[];
    requestData?: any;
  }> {
    // Guardar datos originales de la solicitud fuera del try para que esté disponible en catch

    try {
      console.log("Datos recibidos en el servicio:", usuarioData);
      console.log("Rol recibido:", rolParam);

      // Si se especifica un rol desde el parámetro, lo usamos
      if (rolParam) {
        usuarioData.rol = rolParam;
      } else {
        usuarioData.rol = "usuario"; // valor por defecto
      }

      // Validar datos con Zod
      const validatedData = UsuarioSchema.parse({
        ...usuarioData,
        edad: Number(usuarioData.edad),
        identificacion: Number(usuarioData.identificacion),
      });

      // Verificar si el usuario ya existe por correo
      const usuarioExistenteCorreo = await PersonaModel.findOne({
        correo: validatedData.correo,
      });

      // Verificar si el usuario ya existe por identificación
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
        estadoPersona: validatedData.estadoPersona ?? true,
        password: await hashPassword(validatedData.password),
        fechaCreacionPersona: new Date(),
        // Aseguramos que los campos opcionales se pasen correctamente
        nit: validatedData.nit || undefined,
        nombreEmpresa: validatedData.nombreEmpresa || undefined,
        codigoVendedor: validatedData.codigoVendedor || undefined,
        ventasRealizadas: validatedData.ventasRealizadas || undefined,
      });

      // Guardar en la base de datos
      const savedUsuario = await nuevoUsuario.save();

      // Generar token de autenticación
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
          usuario: usuarioResponse,
          token,
        },
      };
    } catch (error) {
      console.error("Error en PersonaService.registerUsuario:", error);

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
    console.log(id);

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

      if (updatePayload.identificacion) {
        const identificacionExistente = await PersonaModel.findOne({
          identificacion: updatePayload.identificacion,
          idPersona: { $ne: id }, // Excluir al usuario actual
        });

        if (identificacionExistente) {
          return {
            success: false,
            error: "Ya existe un usuario con esta identificación",
            code: 400,
          };
        }
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
