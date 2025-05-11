import { z } from 'zod';

export const CambioContrasenaSchema = z.object({
  contrasenaActual: z.string().min(1, "La contraseña actual es requerida"),
  nuevaContrasena: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
  confirmacionNuevaContrasena: z.string()
}).refine(data => data.nuevaContrasena === data.confirmacionNuevaContrasena, {
  message: "Las contraseñas no coinciden",
  path: ["confirmacionNuevaContrasena"]
});