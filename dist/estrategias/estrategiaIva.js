"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstrategiaConIVA = void 0;
class EstrategiaConIVA {
    calcularSubtotal(precio, cantidad, descuento, impuestos) {
        const subtotal = precio * cantidad;
        const descuentoAplicado = subtotal * (descuento / 100);
        const base = subtotal - descuentoAplicado;
        const impuestosAplicados = base * (impuestos / 100);
        return base + impuestosAplicados;
    }
}
exports.EstrategiaConIVA = EstrategiaConIVA;
