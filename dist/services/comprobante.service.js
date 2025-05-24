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
            // 1. Obtener la venta con vendedor directamente (populate manual)
            const venta = await venta_model_1.VentaModel.findById(ventaId).lean();
            if (!venta)
                throw new Error("Venta no encontrada");
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
            // 5. Enriquecer productos en la venta con los datos del producto
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
            // 6. Crear la venta enriquecida con vendedor
            const ventaEnriquecida = {
                ...venta,
                vendedorInfo: vendedorInfo,
            };
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
            }
            doc.pipe(fs_1.default.createWriteStream(filePath));
            if (tipo === "factura") {
                this.generarFacturaEstilizada(doc, ventaEnriquecida);
            }
            else {
                this.generarTicketEstilizado(doc, ventaEnriquecida);
            }
            doc.end();
            await new Promise((resolve) => doc.on("finish", resolve));
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
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Error al generar comprobante",
            };
        }
    }
    static generarFacturaEstilizada(doc, venta) {
        // ENCABEZADO PRINCIPAL CON DISEÑO PROFESIONAL
        // Fondo azul para el encabezado
        doc
            .rect(0, 0, doc.page.width, 120)
            .fillColor('#2c3e50')
            .fill();
        // Logo y nombre de la empresa (lado izquierdo)
        doc
            .fillColor('#ffffff')
            .fontSize(28)
            .font("Helvetica-Bold")
            .text("MERCAAPP", 50, 30);
        doc
            .fontSize(12)
            .font("Helvetica")
            .text("Sistema de Gestión Comercial", 50, 65)
            .text("Popayán, Cauca - Colombia", 50, 80)
            .text("Email: mercaapp@gmail.com", 50, 95);
        // FACTURA (lado derecho)
        doc
            .fontSize(32)
            .font("Helvetica-Bold")
            .fillColor('#ffffff')
            .text("FACTURA", 350, 40, { align: "right" });
        // Resetear color para el resto del documento
        doc.fillColor('#000000');
        // INFORMACIÓN DEL VENDEDOR Y FACTURA
        let currentY = 150;
        // Caja de información del vendedor
        doc
            .rect(50, currentY, 240, 80)
            .strokeColor('#e0e0e0')
            .lineWidth(1)
            .stroke();
        doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .fillColor('#2c3e50')
            .text("VENDEDOR", 60, currentY + 10);
        doc
            .fontSize(11)
            .font("Helvetica")
            .fillColor('#000000')
            .text(`${venta.vendedorInfo.nombrePersona} ${venta.vendedorInfo.apellido}`, 60, currentY + 30)
            .text("Popayán, Cauca", 60, currentY + 45)
            .text("Colombia", 60, currentY + 60);
        // Caja de información de la factura
        doc
            .rect(310, currentY, 240, 80)
            .strokeColor('#e0e0e0')
            .lineWidth(1)
            .stroke();
        doc
            .fontSize(11)
            .font("Helvetica-Bold")
            .fillColor('#2c3e50')
            .text("NÚMERO DE FACTURA", 320, currentY + 10)
            .fillColor('#000000')
            .font("Helvetica")
            .text(`${venta.idVenta}`, 320, currentY + 25);
        doc
            .font("Helvetica-Bold")
            .fillColor('#2c3e50')
            .text("FECHA DE EMISIÓN", 320, currentY + 40)
            .fillColor('#000000')
            .font("Helvetica")
            .text(new Date(venta.fechaVenta).toLocaleString("es-CO"), 320, currentY + 55);
        // MÉTODO DE PAGO
        currentY = 250;
        doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .fillColor('#2c3e50')
            .text("MÉTODO DE PAGO", 50, currentY);
        const metodoPago = venta.metodoPago || "Efectivo";
        doc
            .fontSize(11)
            .font("Helvetica")
            .fillColor('#000000')
            .text(metodoPago, 50, currentY + 20);
        // TABLA DE PRODUCTOS CON DISEÑO MEJORADO
        currentY = 300;
        // Encabezado de la tabla con fondo
        doc
            .rect(50, currentY, 500, 25)
            .fillColor('#f8f9fa')
            .fill()
            .strokeColor('#e0e0e0')
            .lineWidth(1)
            .stroke();
        doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor('#2c3e50')
            .text("DESCRIPCIÓN", 60, currentY + 8)
            .text("CANT.", 320, currentY + 8, { width: 40, align: "center" })
            .text("PRECIO UNIT.", 370, currentY + 8, { width: 70, align: "right" })
            .text("SUBTOTAL", 450, currentY + 8, { width: 90, align: "right" });
        // Productos
        currentY += 25;
        doc.fillColor('#000000').font("Helvetica");
        venta.productos.forEach((producto, index) => {
            // Alternar color de fondo para mejor legibilidad
            if (index % 2 === 0) {
                doc
                    .rect(50, currentY, 500, 25)
                    .fillColor('#fafafa')
                    .fill();
            }
            doc
                .rect(50, currentY, 500, 25)
                .strokeColor('#e0e0e0')
                .lineWidth(0.5)
                .stroke();
            doc
                .fillColor('#000000')
                .fontSize(9)
                .text(producto.nombre, 60, currentY + 7, { width: 250 })
                .text(`${producto.cantidadVendida}`, 320, currentY + 7, {
                width: 40,
                align: "center",
            })
                .text(`$${producto.precioUnitario.toLocaleString('es-CO')}`, 370, currentY + 7, {
                width: 70,
                align: "right",
            })
                .text(`$${producto.subtotal.toLocaleString('es-CO')}`, 450, currentY + 7, {
                width: 90,
                align: "right",
            });
            currentY += 25;
        });
        // SECCIÓN DE TOTALES MEJORADA
        currentY += 20;
        // Caja de totales
        doc
            .rect(350, currentY, 200, 100)
            .strokeColor('#2c3e50')
            .lineWidth(2)
            .stroke();
        // Subtotal
        const subtotal = venta.productos.reduce((acc, producto) => {
            const precioSinImpuesto = producto.subtotal / (1 + (producto.impuestos / 100 || 0));
            return acc + precioSinImpuesto;
        }, 0);
        doc
            .fontSize(10)
            .font("Helvetica")
            .text("Subtotal:", 360, currentY + 15, { width: 100, align: "left" })
            .text(`$${subtotal.toLocaleString('es-CO')}`, 460, currentY + 15, {
            width: 80,
            align: "right",
        });
        // Impuestos
        const totalImpuestos = venta.productos.reduce((acc, producto) => {
            const impuestoProducto = producto.subtotal - (producto.subtotal / (1 + (producto.impuestos / 100 || 0)));
            return acc + impuestoProducto;
        }, 0);
        doc
            .text("IVA:", 360, currentY + 35, { width: 100, align: "left" })
            .text(`$${totalImpuestos.toLocaleString('es-CO')}`, 460, currentY + 35, {
            width: 80,
            align: "right",
        });
        // Línea separadora
        doc
            .moveTo(360, currentY + 55)
            .lineTo(540, currentY + 55)
            .strokeColor('#2c3e50')
            .lineWidth(1)
            .stroke();
        // Total final
        const total = venta.total || subtotal + totalImpuestos;
        doc
            .font("Helvetica-Bold")
            .fontSize(14)
            .fillColor('#2c3e50')
            .text("TOTAL:", 360, currentY + 65, { width: 100, align: "left" })
            .text(`$${total.toLocaleString('es-CO')} COP`, 460, currentY + 65, {
            width: 80,
            align: "right",
        });
        // PIE DE PÁGINA PROFESIONAL
        const pieY = doc.page.height - 100;
        // Línea decorativa
        doc
            .moveTo(50, pieY)
            .lineTo(doc.page.width - 50, pieY)
            .strokeColor('#2c3e50')
            .lineWidth(2)
            .stroke();
        doc
            .fontSize(9)
            .fillColor('#666666')
            .font("Helvetica")
            .text("Gracias por confiar en MercaApp - Su socio comercial en Popayán", 50, pieY + 20, { align: "center", width: doc.page.width - 100 })
            .text("Este documento es una representación impresa de una factura electrónica generada por MercaApp", 50, pieY + 35, { align: "center", width: doc.page.width - 100 })
            .text(`Generado el ${new Date().toLocaleString('es-CO')}`, 50, pieY + 50, { align: "center", width: doc.page.width - 100 });
    }
    static generarTicketEstilizado(doc, venta) {
        // ENCABEZADO MEJORADO
        doc
            .fontSize(22)
            .font("Helvetica-Bold")
            .fillColor('#2c3e50')
            .text("MERCAAPP", { align: "center" });
        doc
            .fontSize(14)
            .font("Helvetica")
            .fillColor('#666666')
            .text("TICKET DE VENTA", { align: "center" });
        doc
            .fontSize(10)
            .text("Popayán, Cauca - Colombia", { align: "center" });
        doc.moveDown();
        // Línea decorativa
        doc
            .moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .strokeColor('#2c3e50')
            .lineWidth(2)
            .stroke();
        doc.moveDown();
        // Información básica en caja
        const infoY = doc.y;
        doc
            .rect(50, infoY, doc.page.width - 100, 80)
            .strokeColor('#e0e0e0')
            .lineWidth(1)
            .stroke();
        doc
            .fontSize(11)
            .fillColor('#000000')
            .font("Helvetica-Bold")
            .text(`Ticket N°: ${venta.idVenta}`, 60, infoY + 10)
            .text(`Fecha: ${new Date(venta.fechaVenta).toLocaleString("es-CO")}`, 60, infoY + 25)
            .text(`Vendedor: ${venta.vendedorInfo.nombrePersona} ${venta.vendedorInfo.apellido}`, 60, infoY + 40)
            .text(`Método de pago: ${venta.metodoPago || "Efectivo"}`, 60, infoY + 55);
        doc.y = infoY + 90;
        doc.moveDown();
        // PRODUCTOS CON MEJOR FORMATO
        doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .fillColor('#2c3e50')
            .text("DETALLE DE PRODUCTOS:");
        doc.moveDown(0.5);
        doc.font("Helvetica").fillColor('#000000');
        let totalImpuestos = 0;
        venta.productos.forEach((producto, index) => {
            const impuesto = producto.impuestos ?
                (producto.subtotal - (producto.subtotal / (1 + (producto.impuestos / 100)))) : 0;
            totalImpuestos += impuesto;
            // Producto principal
            doc
                .fontSize(10)
                .font("Helvetica-Bold")
                .text(`${producto.cantidadVendida}x ${producto.nombre}`)
                .font("Helvetica")
                .text(`   $${producto.precioUnitario.toLocaleString('es-CO')} c/u → $${producto.subtotal.toLocaleString('es-CO')}`, { indent: 20 });
            // Impuesto si aplica
            if (producto.impuestos > 0) {
                doc
                    .fontSize(9)
                    .fillColor('#666666')
                    .text(`   IVA (${producto.impuestos}%): $${impuesto.toLocaleString('es-CO')}`, { indent: 20 });
            }
            doc.fillColor('#000000').moveDown(0.3);
        });
        doc.moveDown();
        // Línea separadora
        doc
            .moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .strokeColor('#2c3e50')
            .lineWidth(1)
            .stroke();
        doc.moveDown();
        // TOTALES CON MEJOR PRESENTACIÓN
        const subtotal = venta.total - totalImpuestos;
        doc
            .fontSize(11)
            .font("Helvetica")
            .text(`Subtotal: $${subtotal.toLocaleString('es-CO')}`, { align: "right" })
            .text(`IVA: $${totalImpuestos.toLocaleString('es-CO')}`, { align: "right" });
        doc.moveDown();
        // TOTAL DESTACADO
        doc
            .font("Helvetica-Bold")
            .fontSize(16)
            .fillColor('#2c3e50')
            .text(`TOTAL: $${venta.total.toLocaleString('es-CO')} COP`, { align: "right" });
        doc.moveDown(2);
        // Mensaje de agradecimiento mejorado
        doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .fillColor('#2c3e50')
            .text("¡Gracias por su preferencia!", { align: "center" });
        doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor('#666666')
            .text("Vuelva pronto - MercaApp", { align: "center" })
            .text(`Generado: ${new Date().toLocaleString('es-CO')}`, { align: "center" });
    }
    static async obtenerHistorialComprobantes(ventaId) {
        try {
            const comprobantesDir = "C:/MercaApp_Comprobantes/facturas";
            // Verificar si el directorio existe
            if (!fs_1.default.existsSync(comprobantesDir)) {
                return {
                    success: true,
                    data: [],
                    mensaje: "No se encontraron comprobantes",
                };
            }
            const files = fs_1.default
                .readdirSync(comprobantesDir)
                .filter((file) => file.includes(ventaId))
                .map((file) => ({
                nombre: file,
                rutaCompleta: path_1.default.join(comprobantesDir, file),
                fecha: fs_1.default.statSync(path_1.default.join(comprobantesDir, file)).mtime,
            }));
            return {
                success: true,
                data: files,
                mensaje: "Historial de comprobantes obtenido",
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error al obtener historial",
            };
        }
    }
}
exports.ComprobanteService = ComprobanteService;
