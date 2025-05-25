export interface ISolicitudCambioRolCreate {
  rolSolicitado: 'vendedor' | 'microempresario';
  motivoSolicitud: string;
  datosAdicionales?: {
    // Para microempresario
    nit?: number;
    nombreEmpresa?: string;
    // Para vendedor
    codigoVendedor?: string;
    experienciaVentas?: string;
  };
}

export interface ISolicitudCambioRolResponse {
  decision: 'aprobada' | 'rechazada';
  comentario?: string;
}

// types/notificacion.types.ts
export interface INotificacionCreate {
  usuarioDestino: string;
  tipoNotificacion: 'solicitud_cambio_rol' | 'respuesta_solicitud' | 'general';
  titulo: string;
  mensaje: string;
  referenciaDocumento?: string;
  datosAdicionales?: any;
}