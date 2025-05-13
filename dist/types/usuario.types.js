"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioSchema = void 0;
const zod_1 = require("zod");
exports.UsuarioSchema = zod_1.z.object({
    rol: zod_1.z.string(),
    estadoPersona: zod_1.z.boolean().default(true),
    nombrePersona: zod_1.z.string(),
    apellido: zod_1.z.string(),
    edad: zod_1.z.number(),
    identificacion: zod_1.z.number(),
    correo: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    // Campos opcionales específicos para microempresarios y vendedores
    nit: zod_1.z.string().optional(),
    nombreEmpresa: zod_1.z.string().optional(),
    codigoVendedor: zod_1.z.string().optional(),
    // Aseguramos que todas las propiedades desconocidas también pasen la validación
}).passthrough();
