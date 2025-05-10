import { z } from "zod";

export const UsuarioSchema = z.object({
  nombrePersona: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  edad: z.number().int().min(18, "Debe ser mayor de edad"),
  identificacion: z
    .number()
    .int()
    .positive("La identificación debe ser positiva"),
  correo: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
 rol: z
    .enum(["usuario", "administrador", "microempresario", "vendedor"], {
      errorMap: () => ({ message: "Este rol no es válido" })
    })
    .default("usuario"),
  estadoPersona: z.boolean().default(true),
});

export type IUsuario = z.infer<typeof UsuarioSchema>;
export type IUsuarioResponse = Omit<IUsuario, "password"> & { id: string };
