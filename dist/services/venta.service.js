"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentaService = void 0;
const venta_model_1 = require("../models/venta/venta.model");
const persona_model_1 = require("../models/persona/persona.model");
const producto_model_1 = require("../models/producto/producto.model");
const estrategiaIva_1 = require("../estrategias/estrategiaIva");
const productoVenta_1 = require("../models/venta/productoVenta");
class VentaService {
    static async registrarVenta(vendedorId, ventaData) {
        try {
            // 1. Validar vendedor por idPersona
            const vendedor = await persona_model_1.PersonaModel.findOne({
                idPersona: vendedorId,
                rol: { $in: ["vendedor", "administrador"] },
                estadoPersona: true,
            });
            if (!vendedor) {
                throw new Error("Vendedor no válido o no activo");
            }
            // 2. Validar y procesar productos
            const productosProcesados = await this.procesarProductos(ventaData.productos);
            // 3. Calcular total
            const total = productosProcesados.reduce((sum, p) => sum + p.subtotal, 0);
            // 4. Crear y guardar venta
            const nuevaVenta = new venta_model_1.VentaModel({
                productos: productosProcesados,
                IdMetodoPago: ventaData.IdMetodoPago,
                total,
                vendedor: vendedorId,
            });
            await nuevaVenta.save();
            // 5. Actualizar vendedor (creará el campo si no existe)
            await this.actualizarVentasVendedor(vendedorId, nuevaVenta.idVenta);
            return {
                success: true,
                data: await nuevaVenta,
                mensaje: "Venta registrada correctamente",
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error al registrar venta",
            };
        }
    }
    // También asegúrate de que procesarProductos mantenga la información completa
    static async procesarProductos(productos) {
        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            throw new Error("Debe incluir al menos un producto");
        }
        const resultados = [];
        const estrategia = new estrategiaIva_1.EstrategiaConIVA(); // Estrategia fija, o podrías cambiarla dinámicamente
        for (const producto of productos) {
            const productoBD = await producto_model_1.ProductoModel.findOne({
                idProducto: producto.idProducto,
                estado: true,
            });
            if (!productoBD) {
                throw new Error(`Producto ${producto.idProducto} no encontrado o inactivo`);
            }
            if (productoBD.cantidad < producto.cantidadVendida) {
                throw new Error(`Stock insuficiente para ${productoBD.nombre}`);
            }
            // Usa ProductoVenta y estrategia
            const productoVenta = new productoVenta_1.ProductoVenta(productoBD.idProducto, productoBD.nombre, productoBD.categoria, producto.cantidadVendida, productoBD.precio, productoBD.descuento || 0, productoBD.impuestos || 0, estrategia);
            const subtotal = productoVenta.calcularSubtotal();
            // Actualizar stock
            await producto_model_1.ProductoModel.updateOne({ idProducto: productoBD.idProducto }, { $inc: { cantidad: -producto.cantidadVendida } });
            resultados.push({
                idProducto: productoBD.idProducto,
                nombre: productoBD.nombre,
                categoria: productoBD.categoria,
                cantidadVendida: producto.cantidadVendida,
                precioUnitario: productoBD.precio,
                descuento: productoBD.descuento,
                impuestos: productoBD.impuestos,
                subtotal,
            });
        }
        return resultados;
    }
    // private static async procesarProductos(productos: any[]) {
    //   if (!productos || !Array.isArray(productos) || productos.length === 0) {
    //     throw new Error("Debe incluir al menos un producto");
    //   }
    //   const resultados = [];
    //   for (const producto of productos) {
    //     const productoBD = await ProductoModel.findOne({
    //       idProducto: producto.idProducto,
    //       estado: true,
    //     });
    //     if (!productoBD) {
    //       throw new Error(
    //         `Producto ${producto.idProducto} no encontrado o inactivo`
    //       );
    //     }
    //     if (productoBD.cantidad < producto.cantidadVendida) {
    //       throw new Error(`Stock insuficiente para ${productoBD.nombre}`);
    //     }
    //     // Cálculos
    //     const precioUnitario = productoBD.precio;
    //     const descuento = productoBD.descuento || 0;
    //     const impuestos = productoBD.impuestos || 0;
    //     const subtotal = precioUnitario * producto.cantidadVendida;
    //     const descuentoAplicado = subtotal * (descuento / 100);
    //     const impuestosAplicados =
    //       (subtotal - descuentoAplicado) * (impuestos / 100);
    //     const subtotalConImpuestos =
    //       subtotal - descuentoAplicado + impuestosAplicados;
    //     // Actualizar stock
    //     await ProductoModel.updateOne(
    //       { idProducto: productoBD.idProducto },
    //       { $inc: { cantidad: -producto.cantidadVendida } }
    //     );
    //     resultados.push({
    //       idProducto: productoBD.idProducto,
    //       nombre: productoBD.nombre,
    //       categoria: productoBD.categoria,
    //       cantidadVendida: producto.cantidadVendida,
    //       precioUnitario,
    //       descuento,
    //       impuestos,
    //       subtotal: subtotalConImpuestos,
    //     });
    //   }
    //   return resultados;
    // }
    static async actualizarVentasVendedor(vendedorId, ventaId) {
        // Esta operación creará el campo ventasRealizadas si no existe
        const result = await persona_model_1.PersonaModel.updateOne({ idPersona: vendedorId }, { $push: { ventasRealizadas: ventaId } });
        if (result.matchedCount === 0) {
            throw new Error("No se encontró el vendedor para actualizar");
        }
    }
    static async obtenerTodasLasVentas() {
        try {
            const ventas = await venta_model_1.VentaModel.find().lean();
            // Obtener todos los IDs de productos únicos
            const todosProductosIds = [
                ...new Set(ventas.flatMap((v) => v.productos.map((p) => p.idProducto))),
            ];
            // Buscar todos los productos relevantes en una sola consulta
            const productos = await producto_model_1.ProductoModel.find({
                idProducto: { $in: todosProductosIds },
            })
                .select("idProducto nombre categoria")
                .lean();
            // Crear mapa para acceso rápido a productos por ID
            const productosMap = new Map(productos.map((p) => [p.idProducto, p]));
            // Procesar todas las ventas con Promise.all para manejar las consultas en paralelo
            const ventasConDatos = await Promise.all(ventas.map(async (venta) => {
                // Obtener vendedor
                const vendedor = await persona_model_1.PersonaModel.findOne({
                    idPersona: venta.vendedor,
                })
                    .select("idPersona nombrePersona apellido")
                    .lean();
                // Procesar productos de la venta
                const productosConDatos = venta.productos.map((productoVenta) => {
                    const producto = productosMap.get(productoVenta.idProducto) || {
                        nombre: "Producto no encontrado",
                        categoria: "Sin categoría",
                    };
                    return {
                        ...productoVenta,
                        producto: {
                            nombre: producto.nombre,
                            categoria: producto.categoria,
                        },
                    };
                });
                // Retornar venta con datos enriquecidos
                return {
                    ...venta,
                    vendedor: vendedor || {
                        nombrePersona: "No disponible",
                        apellido: "",
                    },
                    productos: productosConDatos,
                };
            }));
            return {
                success: true,
                data: ventasConDatos,
                mensaje: "Ventas con datos mínimos obtenidas correctamente",
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error al obtener ventas",
            };
        }
    }
    static async obtenerVentasPorVendedor(idPersona) {
        try {
            console.log("Buscando ventas para vendedor con ID:", idPersona);
            // Verificar si el vendedor existe
            const persona = await persona_model_1.PersonaModel.findOne({ idPersona })
                .select("idPersona nombrePersona apellido")
                .lean();
            if (!persona) {
                return {
                    success: false,
                    mensaje: "Vendedor no encontrado",
                };
            }
            console.log("Persona encontrada:", persona);
            // CORRECCIÓN: Convertir idPersona a ObjectId para la consulta
            const mongoose = require('mongoose');
            const ObjectId = mongoose.Types.ObjectId;
            // Asegurarse de que idPersona sea un ObjectId válido
            const idPersonaObjectId = new ObjectId(idPersona);
            const ventas = await venta_model_1.VentaModel.find({ vendedor: idPersonaObjectId }).lean();
            // Alternativa más simple que también debería funcionar:
            // const ventas = await VentaModel.find({ vendedor: idPersona }).lean();
            console.log(`Se encontraron ${ventas.length} ventas para el vendedor ${idPersona}`, ventas);
            if (ventas.length === 0) {
                return {
                    success: true,
                    data: [],
                    mensaje: "No se encontraron ventas para este vendedor",
                };
            }
            // Obtener todos los IDs de productos únicos
            const todosProductosIds = [
                ...new Set(ventas.flatMap((v) => v.productos.map((p) => p.idProducto))),
            ];
            // Buscar todos los productos relevantes en una sola consulta
            const productos = await producto_model_1.ProductoModel.find({
                idProducto: { $in: todosProductosIds },
            })
                .select("idProducto nombre categoria")
                .lean();
            // Crear mapa para acceso rápido a productos por ID
            const productosMap = new Map(productos.map((p) => [p.idProducto, p]));
            const vendedorInfo = {
                _id: persona._id,
                idPersona: persona.idPersona,
                nombrePersona: persona.nombrePersona,
                apellido: persona.apellido,
            };
            // Procesar todas las ventas añadiendo información de productos
            const ventasConDatos = ventas.map((venta) => {
                // Procesar productos de la venta
                const productosConDatos = venta.productos.map((productoVenta) => {
                    const producto = productosMap.get(productoVenta.idProducto) || {
                        nombre: "Producto no encontrado",
                        categoria: "Sin categoría",
                    };
                    return {
                        ...productoVenta,
                        producto: {
                            nombre: producto.nombre,
                            categoria: producto.categoria,
                        },
                    };
                });
                // Retornar venta con datos enriquecidos
                return {
                    ...venta,
                    vendedor: vendedorInfo,
                    productos: productosConDatos,
                    idVenta: venta._id.toString(),
                };
            });
            return {
                success: true,
                data: ventasConDatos,
                mensaje: "Ventas por vendedor obtenidas correctamente",
            };
        }
        catch (error) {
            console.error("Error al obtener ventas por vendedor:", error);
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Error al obtener ventas por vendedor",
            };
        }
    }
}
exports.VentaService = VentaService;
