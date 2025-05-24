import mongoose from "mongoose";

export interface IPersona {
  idPersona: mongoose.Types.ObjectId;
  rol: string;
  estadoPersona: boolean;
  nombrePersona: string;
  apellido: string;
  edad: number;
  identificacion: number;
  correo: string;
  password: string;
  fechaCreacionPersona: Date;
  nit?: string; // Para microempresarios
  nombreEmpresa?: string; // Para microempresarios
  codigoVendedor?: string; //
  ventasRealizadas: mongoose.Types.ObjectId[];
}

export interface IPersonaDocument extends IPersona, Document {}
