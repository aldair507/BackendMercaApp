"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComprobanteService = void 0;
const venta_model_1 = require("../models/venta.model");
const producto_model_1 = require("../models/producto.model");
const persona_model_1 = require("../models/persona.model");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ComprobanteService {
    static async generarComprobante(ventaId, tipo = "ticket", options) {
        try {
            console.log("🎯 Generando comprobante para ventaId:", ventaId);
            // ✅ CORRECCIÓN: Usar findOne con idVenta en lugar de findById
            const venta = await venta_model_1.VentaModel.findOne({ idVenta: ventaId.trim() }).lean();
            if (!venta) {
                console.error("❌ Venta no encontrada con ID:", ventaId);
                // Debug: mostrar algunas ventas existentes
                const ventasExistentes = await venta_model_1.VentaModel.find({}, { idVenta: 1 }).limit(3).lean();
                console.log("📋 Ventas existentes:", ventasExistentes.map(v => v.idVenta));
                throw new Error(`Venta no encontrada con ID: ${ventaId}`);
            }
            console.log("✅ Venta encontrada:", venta.idVenta);
            // 2. Obtener vendedor directamente por su id
            const vendedor = await persona_model_1.PersonaModel.findOne({
                idPersona: venta.vendedor,
            })
                .select("idPersona nombrePersona apellido")
                .lean();
            const vendedorInfo = vendedor || {
                nombrePersona: "No disponible",
                apellido: "",
            };
            console.log("✅ Vendedor encontrado:", vendedorInfo);
            // 3. Obtener productos únicos de la venta
            const productosIds = [
                ...new Set(venta.productos.map((p) => p.idProducto)),
            ];
            // 4. Buscar todos los productos en una sola consulta
            const productos = await producto_model_1.ProductoModel.find({
                idProducto: { $in: productosIds },
            })
                .select("idProducto nombre categoria")
                .lean();
            const productosMap = new Map(productos.map((p) => [p.idProducto, p]));
            console.log("✅ Productos encontrados:", productos.length);
            // 5. Enriquecer productos en la venta con los datos del producto
            console.log("🔍 Productos antes de enriquecer:", venta.productos);
            venta.productos = venta.productos.map((productoVenta) => {
                const producto = productosMap.get(productoVenta.idProducto) || {
                    nombre: "Producto no encontrado",
                    categoria: "Sin categoría",
                };
                return {
                    ...productoVenta,
                    nombre: producto.nombre,
                    categoria: producto.categoria,
                };
            });
            console.log("🔍 Productos después de enriquecer:", venta.productos);
            // 6. Crear la venta enriquecida con vendedor
            const ventaEnriquecida = {
                ...venta,
                vendedorInfo: vendedorInfo,
            };
            console.log("🔍 Iniciando creación de PDF...");
            // 7. Crear documento PDF
            const doc = new pdfkit_1.default({
                size: tipo === "ticket" ? "A5" : "A4",
                margin: 50,
            });
            // Nombre del archivo mejorado con timestamp legible
            const fechaArchivo = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const horaArchivo = new Date().toTimeString().slice(0, 5).replace(':', '');
            const fileName = tipo === "factura"
                ? `factura_${ventaId}_${fechaArchivo}_${horaArchivo}.pdf`
                : `ticket_${ventaId}_${fechaArchivo}_${horaArchivo}.pdf`;
            const filePath = path_1.default.join("C:/MercaApp_Comprobantes/facturas", fileName);
            // Crear el directorio si no existe
            if (!fs_1.default.existsSync(path_1.default.dirname(filePath))) {
                fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
                console.log("✅ Directorio creado:", path_1.default.dirname(filePath));
            }
            console.log("🔍 Configurando stream del PDF...");
            const stream = fs_1.default.createWriteStream(filePath);
            doc.pipe(stream);
            console.log("🔍 Generando contenido del PDF...");
            try {
                if (tipo === "factura") {
                    this.generarFacturaEstilizada(doc, ventaEnriquecida);
                }
                else {
                    this.generarTicketEstilizado(doc, ventaEnriquecida);
                }
                console.log("✅ Contenido del PDF generado");
            }
            catch (pdfError) {
                console.error("❌ Error al generar contenido del PDF:", pdfError);
                throw pdfError;
            }
            console.log("🔍 Finalizando documento PDF...");
            doc.end();
            // Promesa con timeout para evitar colgarse
            const pdfPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: La generación del PDF tomó demasiado tiempo'));
                }, 30000); // 30 segundos timeout
                stream.on("finish", () => {
                    clearTimeout(timeout);
                    console.log("✅ PDF generado exitosamente:", filePath);
                    resolve();
                });
                stream.on("error", (error) => {
                    clearTimeout(timeout);
                    console.error("❌ Error en el stream:", error);
                    reject(error);
                });
                doc.on("error", (error) => {
                    clearTimeout(timeout);
                    console.error("❌ Error al generar PDF:", error);
                    reject(error);
                });
            });
            await pdfPromise;
            return {
                success: true,
                data: {
                    url: filePath, // Ruta completa del archivo
                    nombreArchivo: fileName,
                    tipo,
                    rutaCompleta: filePath,
                },
                mensaje: "Comprobante generado correctamente",
            };
        }
        catch (error) {
            console.error("❌ Error completo en generarComprobante:", error);
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Error al generar comprobante",
            };
        }
    }
    // ✅ Método mejorado para generar factura con diseño profesional - CORREGIDO
    static generarFacturaEstilizada(doc, venta) {
        const fecha = new Date(venta.fechaVenta).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const hora = new Date(venta.fechaVenta).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        // 🎨 HEADER MODERNO CON GRADIENTE VISUAL
        // Fondo del header (simulando gradiente con rectángulos)
        doc.rect(0, 0, 612, 120).fill('#2c3e50');
        doc.rect(0, 120, 612, 20).fill('#34495e');
        // Logo y título de la empresa
        doc.fontSize(28).font('Helvetica-Bold').fillColor('white');
        doc.text('MERCAAPP', 50, 30);
        doc.fontSize(14).font('Helvetica').fillColor('#ecf0f1');
        doc.text('Sistema de Gestión Comercial', 50, 65);
        doc.text('Popayán, Cauca - Colombia', 50, 82);
        doc.text('Email: mercaapp@gmail.com | Tel: (310) 456-7890', 50, 99);
        // Información de la factura (lado derecho del header)
        doc.fontSize(20).font('Helvetica-Bold').fillColor('white');
        doc.text('FACTURA', 450, 30);
        doc.fontSize(11).font('Helvetica').fillColor('#bdc3c7');
        doc.text(`N°: ${venta.idVenta || 'N/A'}`, 450, 60);
        doc.text(`Fecha: ${fecha}`, 450, 75);
        doc.text(`Hora: ${hora}`, 450, 90);
        // Reset color para el resto del documento
        doc.fillColor('black');
        // 📋 INFORMACIÓN DEL VENDEDOR (Sección elegante)
        let yPos = 160;
        // Caja para vendedor
        doc.rect(50, yPos, 250, 60).fillAndStroke('#f8f9fa', '#dee2e6');
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#2c3e50');
        doc.text('VENDEDOR', 60, yPos + 10);
        doc.fontSize(11).font('Helvetica').fillColor('#495057');
        const nombreCompleto = `${venta.vendedorInfo?.nombrePersona || 'N/A'} ${venta.vendedorInfo?.apellido || ''}`.trim();
        doc.text(nombreCompleto, 60, yPos + 28);
        doc.text('Popayán, Cauca', 60, yPos + 42);
        // 📋 INFORMACIÓN DEL CLIENTE (si existiera)
        doc.rect(320, yPos, 240, 60).fillAndStroke('#e8f5e8', '#28a745');
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#155724');
        doc.text('MÉTODO DE PAGO', 330, yPos + 10);
        doc.fontSize(11).font('Helvetica').fillColor('#495057');
        doc.text('Efectivo', 330, yPos + 28);
        // 📊 TABLA DE PRODUCTOS (Diseño moderno)
        yPos = 250;
        // Header de la tabla con fondo
        doc.rect(50, yPos, 510, 30).fill('#6c757d');
        doc.fontSize(11).font('Helvetica-Bold').fillColor('white');
        doc.text('DESCRIPCIÓN', 60, yPos + 10);
        doc.text('CATEGORÍA', 220, yPos + 10);
        doc.text('CANT.', 320, yPos + 10);
        doc.text('PRECIO UNIT.', 370, yPos + 10);
        doc.text('SUBTOTAL', 480, yPos + 10);
        yPos += 30;
        let isEvenRow = false;
        // Reset color para contenido
        doc.fillColor('black');
        // 🔧 CORRECCIÓN: Usar los campos correctos de los productos
        if (venta.productos && Array.isArray(venta.productos)) {
            venta.productos.forEach((producto, index) => {
                // ✅ CORRECCIÓN: Usar cantidadVendida en lugar de cantidad
                const cantidad = producto.cantidadVendida || 0;
                const precioUnitario = producto.precioUnitario || 0;
                // ✅ CORRECCIÓN: Usar el subtotal ya calculado o calcularlo correctamente
                const subtotal = producto.subtotal || (cantidad * precioUnitario);
                // Fondo alternado para las filas
                if (isEvenRow) {
                    doc.rect(50, yPos, 510, 25).fill('#f8f9fa');
                }
                doc.fontSize(10).font('Helvetica').fillColor('#495057');
                doc.text(producto.nombre || 'Producto', 60, yPos + 8, { width: 150 });
                doc.text(producto.categoria || 'Sin categoría', 220, yPos + 8, { width: 90 });
                doc.text(cantidad.toString(), 330, yPos + 8);
                doc.text(`$${precioUnitario.toLocaleString('es-CO')}`, 370, yPos + 8);
                doc.text(`$${subtotal.toLocaleString('es-CO')}`, 480, yPos + 8);
                yPos += 25;
                isEvenRow = !isEvenRow;
            });
        }
        // 💰 SECCIÓN DE TOTALES (Diseño elegante) - CORREGIDO
        yPos += 20;
        // ✅ CORRECCIÓN: Calcular totales correctamente
        const subtotalSinDescuento = venta.productos?.reduce((acc, p) => acc + ((p.cantidadVendida || 0) * (p.precioUnitario || 0)), 0) || 0;
        const descuentoTotal = venta.productos?.reduce((acc, p) => acc + ((p.descuento || 0) * (p.cantidadVendida || 0) * (p.precioUnitario || 0) / 100), 0) || 0;
        // ✅ CORRECCIÓN PRINCIPAL: Calcular total real desde los productos si totalVenta es 0
        const totalCalculado = venta.productos?.reduce((acc, p) => acc + (p.subtotal || 0), 0) || 0;
        const totalVenta = venta.totalVenta && venta.totalVenta > 0 ? venta.totalVenta : totalCalculado;
        // Caja para totales
        doc.rect(350, yPos, 210, 100).fillAndStroke('#e8f4f8', '#17a2b8');
        // Subtotal antes de descuentos
        doc.fontSize(11).font('Helvetica').fillColor('#495057');
        doc.text('Subtotal:', 360, yPos + 15);
        doc.text(`$${subtotalSinDescuento.toLocaleString('es-CO')}`, 480, yPos + 15);
        // Descuentos
        doc.text('Descuentos:', 360, yPos + 32);
        doc.text(`-$${descuentoTotal.toLocaleString('es-CO')}`, 480, yPos + 32);
        // IVA (0% para este caso)
        doc.text('IVA (0%):', 360, yPos + 49);
        doc.text('$0', 480, yPos + 49);
        // Línea separadora
        doc.moveTo(360, yPos + 65).lineTo(550, yPos + 65).stroke();
        // Total final
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#155724');
        doc.text('TOTAL:', 360, yPos + 75);
        doc.text(`$${totalVenta.toLocaleString('es-CO')} COP`, 450, yPos + 75);
        // 🌟 PIE DE PÁGINA ELEGANTE
        yPos += 130;
        // Línea decorativa
        doc.moveTo(50, yPos).lineTo(560, yPos).stroke();
        yPos += 20;
        doc.fontSize(10).font('Helvetica-Oblique').fillColor('#6c757d');
        doc.text('Gracias por confiar en MercaApp. Este documento es un comprobante oficial de venta.', 50, yPos, { align: 'center', width: 500 });
        yPos += 20;
        doc.fontSize(8).fillColor('#adb5bd');
        doc.text(`Documento generado electrónicamente el ${new Date().toLocaleString('es-CO')}`, 50, yPos, { align: 'center', width: 500 });
    }
    // ✅ Método mejorado para generar ticket con diseño moderno - CORREGIDO
    static generarTicketEstilizado(doc, venta) {
        const fecha = new Date(venta.fechaVenta).toLocaleDateString('es-CO');
        const hora = new Date(venta.fechaVenta).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
        });
        // 🎯 HEADER DEL TICKET (Estilo moderno y compacto)
        doc.rect(0, 0, 420, 80).fill('#343a40');
        doc.fontSize(18).font('Helvetica-Bold').fillColor('white');
        doc.text('MERCAAPP', 50, 25, { align: 'center', width: 320 });
        doc.fontSize(10).font('Helvetica').fillColor('#ced4da');
        doc.text('TICKET DE VENTA', 50, 50, { align: 'center', width: 320 });
        // Reset color
        doc.fillColor('black');
        // 📋 INFORMACIÓN DEL TICKET
        let yPos = 100;
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#495057');
        doc.text(`Ticket N°: ${venta.idVenta || 'N/A'}`, 50, yPos);
        yPos += 10;
        doc.text(`Fecha: ${fecha} - ${hora}`, 50, yPos);
        yPos += 15;
        const nombreVendedor = `${venta.vendedorInfo?.nombrePersona || 'N/A'} ${venta.vendedorInfo?.apellido || ''}`.trim();
        doc.text(`Vendedor: ${nombreVendedor}`, 50, yPos);
        yPos += 25;
        // Línea separadora estilizada
        doc.moveTo(50, yPos).lineTo(370, yPos).lineWidth(2).stroke('#dee2e6');
        yPos += 15;
        // 🛒 PRODUCTOS (Diseño limpio) - CORREGIDO
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#6c757d');
        doc.text('PRODUCTOS', 50, yPos);
        yPos += 15;
        if (venta.productos && Array.isArray(venta.productos)) {
            venta.productos.forEach((producto, index) => {
                // ✅ CORRECCIÓN: Usar cantidadVendida en lugar de cantidad
                const cantidad = producto.cantidadVendida || 0;
                const precioUnitario = producto.precioUnitario || 0;
                // ✅ CORRECCIÓN: Usar el subtotal ya calculado
                const subtotal = producto.subtotal || (cantidad * precioUnitario);
                // Nombre del producto
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#212529');
                doc.text(producto.nombre || 'Producto', 50, yPos, { width: 250 });
                yPos += 12;
                // Detalles del producto
                doc.fontSize(8).font('Helvetica').fillColor('#6c757d');
                doc.text(`${cantidad} x $${precioUnitario.toLocaleString('es-CO')} = $${subtotal.toLocaleString('es-CO')}`, 60, yPos);
                // Mostrar descuento si existe
                if (producto.descuento && producto.descuento > 0) {
                    yPos += 10;
                    doc.fontSize(7).fillColor('#dc3545');
                    doc.text(`Descuento: ${producto.descuento}%`, 60, yPos);
                }
                yPos += 18;
            });
        }
        // Línea separadora
        doc.moveTo(50, yPos).lineTo(370, yPos).lineWidth(2).stroke('#dee2e6');
        yPos += 15;
        // 💰 TOTAL (Destacado) - CORREGIDO
        doc.rect(50, yPos, 320, 30).fillAndStroke('#d4edda', '#28a745');
        // ✅ CORRECCIÓN PRINCIPAL: Calcular total real desde los productos si totalVenta es 0
        const totalCalculado = venta.productos?.reduce((acc, p) => acc + (p.subtotal || 0), 0) || 0;
        const totalVenta = venta.totalVenta && venta.totalVenta > 0 ? venta.totalVenta : totalCalculado;
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#155724');
        doc.text(`TOTAL: ${totalVenta.toLocaleString('es-CO')} COP`, 60, yPos + 10);
        // 🌟 PIE DE PÁGINA
        yPos += 50;
        doc.fontSize(8).font('Helvetica-Oblique').fillColor('#6c757d');
        doc.text('¡Gracias por su compra!', 50, yPos, { align: 'center', width: 320 });
        yPos += 15;
        doc.fontSize(7).fillColor('#adb5bd');
        doc.text('MercaApp - Sistema de Gestión Comercial', 50, yPos, { align: 'center', width: 320 });
    }
}
exports.ComprobanteService = ComprobanteService;
