import { IPersona } from "./persona.interface";

export interface IMicroempresario extends IPersona {
  nit: string;
  nombreEmpresa: string;
}