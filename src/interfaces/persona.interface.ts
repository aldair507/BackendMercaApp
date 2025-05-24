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
}


export interface IPersonaDocument extends IPersona, Document {}
