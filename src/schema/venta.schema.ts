import { Schema, model } from 'mongoose';
import { IVenta } from '../interfaces/venta.interface';
import { IProductoVenta } from '../interfaces/productoVenta.interface';
import { IMetodoPago } from '../interfaces/metodoPago.interface';
import { MetodoPago } from '../enums/metodoPago.enums';

const ProductoVentaSchema: Schema = new Schema<IProductoVenta>(
  {
    idProducto: { 
      type: String, 
      required: [true, 'El ID del producto es requerido'] 
    },
    nombre: { 
      type: String, 
      required: [true, 'El nombre del producto es requerido'],
      trim: true
    },
    cantidadVendida: { 
      type: Number, 
      required: [true, 'La cantidad vendida es requerida'],
      min: [1, 'La cantidad mínima es 1'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} no es un valor entero válido'
      }
    },
    precioUnitario: { 
      type: Number, 
      required: [true, 'El precio unitario es requerido'],
      min: [0, 'El precio no puede ser negativo']
    },
    descuento: { 
      type: Number, 
      default: 0,
      min: [0, 'El descuento no puede ser negativo']
    },
    impuestos: { 
      type: Number, 
      default: 0,
      min: [0, 'Los impuestos no pueden ser negativos']
    },
    subtotal: { 
      type: Number, 
      required: [true, 'El subtotal es requerido'],
      min: [0, 'El subtotal no puede ser negativo']
    }
  },
  { 
    _id: false,
    versionKey: false 
  }
);

const MetodoPagoSchema: Schema = new Schema<IMetodoPago>(
  {
    idMetodoPago: { 
      type: String, 
      required: [true, 'El ID del método de pago es requerido'] 
    },
    nombreMetodoPago: { 
      type: String, 
      required: [true, 'El nombre del método de pago es requerido'],
      enum: {
        values: Object.values(MetodoPago),
        message: 'Método de pago no válido. Valores permitidos: {VALUE}'
      },
      uppercase: true,
      trim: true
    },
    fechaEmisionResumen: { 
      type: Date, 
      required: [true, 'La fecha de emisión es requerida'],
      default: Date.now
    },
  },
  { 
    _id: false,
    versionKey: false 
  }
);

const VentaSchema: Schema = new Schema<IVenta>({
  idVenta: { 
    type: String, 
    required: [true, 'El ID de venta es requerido'], 
    unique: true,
    default: () => `VNT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    index: true
  },
  fechaVenta: { 
    type: Date, 
    required: [true, 'La fecha de venta es requerida'], 
    default: Date.now,
    index: -1 // Orden descendente
  },
  productos: { 
    type: [ProductoVentaSchema], 
    required: [true, 'Los productos son requeridos'],
    validate: {
      validator: (value: IProductoVenta[]) => value.length > 0,
      message: 'La venta debe tener al menos un producto'
    }
  },
  metodoPago: { 
    type: MetodoPagoSchema, 
    required: [true, 'El método de pago es requerido'] 
  },
  total: { 
    type: Number, 
    required: [true, 'El total es requerido'],
    min: [0, 'El total no puede ser negativo']
  },
  vendedor: { 
    type: Schema.Types.ObjectId, 
    ref: 'Persona', 
    required: [true, 'El vendedor es requerido'],
    index: true
  }
}, {
  timestamps: true, // Crea createdAt y updatedAt automáticamente
  versionKey: false // Elimina el campo __v
});

// Middleware para cálculos automáticos
VentaSchema.pre<IVenta>(['save', 'updateOne'], function(next) {
  this.productos.forEach(producto => {
    // Manejo seguro de valores opcionales (descuento e impuestos)
    const descuento = producto.descuento || 0;
    const impuestos = producto.impuestos || 0;
    producto.subtotal = (producto.precioUnitario * producto.cantidadVendida) - descuento + impuestos;
  });
  
  this.total = this.productos.reduce((sum, producto) => sum + producto.subtotal, 0);
  next();
});

// Índices compuestos para consultas frecuentes
VentaSchema.index({ vendedor: 1, fechaVenta: -1 }); // Para consultas por vendedor
VentaSchema.index({ 'metodoPago.nombreMetodoPago': 1 }); // Para análisis de métodos de pago

export const VentaModel = model<IVenta>('Venta', VentaSchema);