import { Document } from "mongoose";
import { IPersonaDocument } from "./persona.interface";

export interface ISolicitudCambioRol extends Document {
  idSolicitud: string;
  usuarioSolicitante: IPersonaDocument; // ID del usuario que solicita
  rolActual: string;
  rolSolicitado: string;
  motivoSolicitud: string;
  estadoSolicitud: 'pendiente' | 'aprobada' | 'rechazada';
  fechaSolicitud: Date;
  fechaRespuesta?: Date;
  administradorQueResponde?: string;
  comentarioAdmin?: string;
  datosAdicionales?: {
    // Para microempresario
    nit?: number;
    nombreEmpresa?: string;
    // Para vendedor
    codigoVendedor?: string;
    experienciaVentas?: string;
  };
}