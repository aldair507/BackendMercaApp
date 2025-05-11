"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CambioContrasenaSchema = void 0;
const zod_1 = require("zod");
exports.CambioContrasenaSchema = zod_1.z.object({
    contrasenaActual: zod_1.z.string().min(1, "La contraseña actual es requerida"),
    nuevaContrasena: zod_1.z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    confirmacionNuevaContrasena: zod_1.z.string()
}).refine(data => data.nuevaContrasena === data.confirmacionNuevaContrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmacionNuevaContrasena"]
});
