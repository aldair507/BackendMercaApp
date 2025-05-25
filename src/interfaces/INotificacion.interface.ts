import { Document } from "mongoose";

export interface INotificacion extends Document {
  idNotificacion: string;
  usuarioDestino: string;
  tipoNotificacion: 'solicitud_cambio_rol' | 'respuesta_solicitud' | 'general';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: Date;
  fechaLeida?: Date;
  datosAdicionales?: any;
  referenciaDocumento?: string; // ID de la solicitud relacionada
}