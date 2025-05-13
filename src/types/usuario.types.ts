import { z } from "zod";

export const UsuarioSchema = z.object({
  rol: z.string(),
  estadoPersona: z.boolean().default(true),
  nombrePersona: z.string(),
  apellido: z.string(),
  edad: z.number(),
  identificacion: z.number(),
  correo: z.string().email(),
  password: z.string().min(6),
  // Campos opcionales específicos para microempresarios y vendedores
  nit: z.string().optional(),
  nombreEmpresa: z.string().optional(),
  codigoVendedor: z.string().optional(),
  // Aseguramos que todas las propiedades desconocidas también pasen la validación
}).passthrough();


export type IUsuario = z.infer<typeof UsuarioSchema>;
export type IUsuarioResponse = Omit<IUsuario, "password"> & { id: string };
