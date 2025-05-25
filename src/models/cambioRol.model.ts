import { ISolicitudCambioRol } from "../interfaces/ICambioRol";
import mongoose, { Schema, model } from "mongoose";


const SolicitudCambioRolSchema = new Schema<ISolicitudCambioRol>({
  idSolicitud: {
    type: String,
    required: true,
    unique: true,
  },
  usuarioSolicitante: {
  type:mongoose.Schema.Types.ObjectId,
  required: true,
  ref: 'Usuarios'
},

  rolActual: {
    type: String,
    required: true,
    enum: ['usuario', 'vendedor', 'microempresario','administrador']
  },
  rolSolicitado: {
    type: String,
    required: true,
    enum: ['vendedor', 'microempresario']
  },
  motivoSolicitud: {
    type: String,
    required: true,
    maxlength: 500
  },
  estadoSolicitud: {
    type: String,
    enum: ['pendiente', 'aprobada', 'rechazada'],
    default: 'pendiente'
  },
  fechaSolicitud: {
    type: Date,
    default: Date.now
  },
  fechaRespuesta: Date,
  administradorQueResponde: String,
  comentarioAdmin: String,
  datosAdicionales: {
    nit: Number,
    nombreEmpresa: String,
    codigoVendedor: String,
    experienciaVentas: String
  }
}, {
  timestamps: true
});

export const SolicitudCambioRolModel = model<ISolicitudCambioRol>('SolicitudCambioRol', SolicitudCambioRolSchema);
