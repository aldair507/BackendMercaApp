  import { z } from "zod";
  const baseSchema = z.object({
    estadoPersona: z.boolean().default(true),
    nombrePersona: z.string(),
    apellido: z.string(),
    edad: z.number(),
    identificacion: z.number(),
    correo: z.string().email(),
    password: z.string().min(6),
  });

  // Microempresario
  const microempresarioSchema = baseSchema.extend({
    rol: z.literal("microempresario"),
    nit: z.string(),
    nombreEmpresa: z.string(),
  });

  // Vendedor
  const vendedorSchema = baseSchema.extend({
    rol: z.literal("vendedor"),
    codigoVendedor: z.string(),
    ventasRealizadas: z.array(z.string()).optional(),
  });

  // Usuario normal
  const usuarioComunSchema = baseSchema.extend({
    rol: z.literal("usuario"),
  });

  // Unión discriminada
  export const UsuarioSchema = z.discriminatedUnion("rol", [
    microempresarioSchema,
    vendedorSchema,
    usuarioComunSchema,
  ]);

  export type IUsuario = z.infer<typeof UsuarioSchema>;
  export type IUsuarioResponse = Omit<IUsuario, "password"> & { id: string };
    