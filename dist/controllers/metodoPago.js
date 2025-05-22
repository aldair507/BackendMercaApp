"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traerMetodosPago = void 0;
exports.inicializarMetodosPago = inicializarMetodosPago;
const metodoPago_models_1 = require("../models/pagos/metodoPago.models");
async function inicializarMetodosPago() {
    const metodos = [
        { idMetodoPago: "MP001", nombreMetodoPago: "Efectivo" },
        { idMetodoPago: "MP002", nombreMetodoPago: "Tarjeta Crédito" },
        { idMetodoPago: "MP003", nombreMetodoPago: "Transferencia" },
        { idMetodoPago: "MP004", nombreMetodoPago: "Paypal" },
    ];
    for (const metodo of metodos) {
        const existe = await metodoPago_models_1.MetodoPagoModel.findOne({
            idMetodoPago: metodo.idMetodoPago,
        });
        if (!existe) {
            await metodoPago_models_1.MetodoPagoModel.create(metodo);
            console.log(`Método de pago creado: ${metodo.nombreMetodoPago}`);
        }
        else {
            console.log(`Método de pago ya existe: ${metodo.nombreMetodoPago}`);
        }
    }
}
const traerMetodosPago = async (req, res) => {
    try {
        const result = await metodoPago_models_1.MetodoPagoModel.find();
        res.status(201).json(result);
    }
    catch (error) {
        console.log(error);
    }
};
exports.traerMetodosPago = traerMetodosPago;
