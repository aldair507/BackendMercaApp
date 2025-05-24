"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioSchema = void 0;
const zod_1 = require("zod");
const baseSchema = zod_1.z.object({
    estadoPersona: zod_1.z.boolean().default(true),
    nombrePersona: zod_1.z.string(),
    apellido: zod_1.z.string(),
    edad: zod_1.z.number(),
    identificacion: zod_1.z.number(),
    correo: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
// Microempresario
const microempresarioSchema = baseSchema.extend({
    rol: zod_1.z.literal("microempresario"),
    nit: zod_1.z.string(),
    nombreEmpresa: zod_1.z.string(),
});
// Vendedor
const vendedorSchema = baseSchema.extend({
    rol: zod_1.z.literal("vendedor"),
    codigoVendedor: zod_1.z.string(),
    ventasRealizadas: zod_1.z.array(zod_1.z.string()).optional(),
});
// Usuario normal
const usuarioComunSchema = baseSchema.extend({
    rol: zod_1.z.literal("usuario"),
});
// Unión discriminada
exports.UsuarioSchema = zod_1.z.discriminatedUnion("rol", [
    microempresarioSchema,
    vendedorSchema,
    usuarioComunSchema,
]);
