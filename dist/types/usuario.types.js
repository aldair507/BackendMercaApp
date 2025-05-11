"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioSchema = void 0;
const zod_1 = require("zod");
exports.UsuarioSchema = zod_1.z.object({
    nombrePersona: zod_1.z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: zod_1.z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    edad: zod_1.z.number().int().min(18, "Debe ser mayor de edad"),
    identificacion: zod_1.z
        .number()
        .int()
        .positive("La identificación debe ser positiva"),
    correo: zod_1.z.string().email("Correo electrónico inválido"),
    password: zod_1.z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    rol: zod_1.z
        .enum(["usuario", "administrador", "microempresario", "vendedor"], {
        errorMap: () => ({ message: "Este rol no es válido" })
    })
        .default("usuario"),
    estadoPersona: zod_1.z.boolean().default(true),
});
