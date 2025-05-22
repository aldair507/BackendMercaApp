import { MetodoPagoModel } from "../models/pagos/metodoPago.models";
import { Request, Response } from "express";

export async function inicializarMetodosPago() {
  const metodos = [
    { idMetodoPago: "MP001", nombreMetodoPago: "Efectivo" },
    { idMetodoPago: "MP002", nombreMetodoPago: "Tarjeta Crédito" },
    { idMetodoPago: "MP003", nombreMetodoPago: "Transferencia" },
    { idMetodoPago: "MP004", nombreMetodoPago: "Paypal" },
  ];

  for (const metodo of metodos) {
    const existe = await MetodoPagoModel.findOne({
      idMetodoPago: metodo.idMetodoPago,
    });
    if (!existe) {
      await MetodoPagoModel.create(metodo);
      console.log(`Método de pago creado: ${metodo.nombreMetodoPago}`);
    } else {
      console.log(`Método de pago ya existe: ${metodo.nombreMetodoPago}`);
    }
  }
}

export const traerMetodosPago = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await MetodoPagoModel.find();
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
  }
};
