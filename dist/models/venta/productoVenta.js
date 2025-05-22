"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoVenta = void 0;
class ProductoVenta {
    constructor(idProducto, nombre, categoria, cantidadVendida, precioUnitario, descuento, impuestos, estrategia) {
        this.idProducto = idProducto;
        this.nombre = nombre;
        this.categoria = categoria;
        this.cantidadVendida = cantidadVendida;
        this.precioUnitario = precioUnitario;
        this.descuento = descuento;
        this.impuestos = impuestos;
        this.estrategia = estrategia;
    }
    calcularSubtotal() {
        return this.estrategia.calcularSubtotal(this.precioUnitario, this.cantidadVendida, this.descuento, this.impuestos);
    }
}
exports.ProductoVenta = ProductoVenta;
