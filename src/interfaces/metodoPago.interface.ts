import { MetodoPago } from "../enums/metodoPago.enums";

export interface IMetodoPago {
  idMetodoPago: string;
  nombreMetodoPago: MetodoPago | string;
  fechaEmisionResumen: Date;
}