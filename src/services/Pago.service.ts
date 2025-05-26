import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { ACCESS_TOKEN } from "../config/server.config";
import { PayerRequest } from "mercadopago/dist/clients/payment/create/types";
import { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";
import { VentaModel } from "../models/venta.model";

if (!ACCESS_TOKEN) {
  throw new Error(
    "ACCESS_TOKEN is not defined. Please set it in your configuration."
  );
}

const client = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN,
  options: {
    timeout: 5000,
  },
});

const payment = new Payment(client);

export interface MercadoPagoData {
  compradorInfo: {
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    direccion?: string;
    identificacion?: string;
  };
  redirectUrls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
}

export interface MercadoPagoResponse {
  success: boolean;
  data?: {
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint: string;
    ventaId: string;
    total: number;
  };
  mensaje?: string;
  error?: string;
}

export class MercadoPagoService {
  
  /**
   * Crear preferencia de pago en MercadoPago para una venta existente
   */
  static async crearPreferenciaPago(
    venta: any,
    mercadoPagoData: MercadoPagoData
  ): Promise<MercadoPagoResponse> {
    try {
      const { compradorInfo, redirectUrls } = mercadoPagoData;

      // Configurar URLs por defecto si no se proporcionan
      const defaultUrls = {
        success: "https://prueba-mercapp--7re40lyjvl.expo.app/",
        failure: "https://prueba-mercapp--7re40lyjvl.expo.app/",
        pending: "https://prueba-mercapp--7re40lyjvl.expo.app/",
      };

      const urls = { ...defaultUrls, ...redirectUrls };

      // Configurar el pagador
      const payer: PayerRequest = {
        email: compradorInfo.email,
        first_name: compradorInfo.nombre,
        last_name: compradorInfo.apellido,
        phone: compradorInfo.telefono
          ? {
              area_code: "57", // Colombia por defecto
              number: compradorInfo.telefono,
            }
          : undefined,
        address: compradorInfo.direccion
          ? {
              street_name: compradorInfo.direccion,
              street_number: "S/N",
              zip_code: "000000",
              city: "Bogotá",
            }
          : undefined,
        identification: {
          type: "CC",
          number: compradorInfo.identificacion || "12345678",
        },
      };

      // Convertir productos de la venta a items de MercadoPago
      if (!venta || !venta.productos) {
        throw new Error("No se pudo obtener la información de la venta o los productos.");
      }

      const itemsToSale = venta.productos.map((producto: any) => ({
        id: producto.idProducto,
        title: producto.nombre || `Producto ${producto.idProducto}`,
        description: `${producto.categoria || "Sin categoría"} - Cantidad: ${
          producto.cantidadVendida
        }`,
        category_id: producto.categoria || "general",
        quantity: producto.cantidadVendida,
        unit_price: Math.round((producto.precioUnitario ?? 0) * 100) / 100,
      }));

      // Crear la preferencia de pago
      const preference = new Preference(client);
      
      const result = await preference.create({
        body: {
          items: itemsToSale,
          payer,
          external_reference: venta.idVenta,
          redirect_urls: {
            success: urls.success,
            failure: urls.failure,
            pending: urls.pending,
          },
          back_urls: {
            success: urls.success,
            failure: urls.failure,
            pending: urls.pending,
          },
          auto_return: "approved",
        },
        requestOptions: {
          timeout: 5000,
        },
      });

      console.log("Preferencia creada:", result.id);

      // Actualizar la venta con información de MercadoPago
      await VentaModel.updateOne(
        { idVenta: venta.idVenta },
        {
          $set: {
            externalReference: result.id,
            estadoPago: "pending",
            compradorInfo: {
              email: compradorInfo.email,
              nombre: compradorInfo.nombre,
              apellido: compradorInfo.apellido,
              telefono: compradorInfo.telefono,
              direccion: compradorInfo.direccion,
            },
          },
        }
      );

      console.log("Orden de pago creada para venta:", venta.idVenta);

      return {
        success: true,
        data: {
          preferenceId: result.id!,
          initPoint: result.init_point!,
          sandboxInitPoint: result.sandbox_init_point!,
          ventaId: venta.idVenta,
          total: venta.total,
        },
        mensaje: "Orden de pago creada exitosamente",
      };

    } catch (error) {
      console.error("Error al crear la preferencia de pago:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        mensaje: "Error al crear la orden de pago",
      };
    }
  }

  /**
   * Procesar notificación de pago exitoso
   */
  static async procesarPagoExitoso(
    paymentId: string,
    externalReference: string
  ): Promise<boolean> {
    try {
      if (externalReference) {
        const venta = await VentaModel.findOne({
          idVenta: externalReference,
        });

        if (venta) {
          await VentaModel.updateOne(
            { idVenta: externalReference },
            {
              $set: {
                paymentId: paymentId,
                estadoPago: "approved",
              },
            }
          );

          console.log(`Venta ${externalReference} marcada como pagada`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error procesando pago exitoso:", error);
      return false;
    }
  }

  /**
   * Procesar notificación de pago fallido
   */
  static async procesarPagoFallido(
    paymentId: string,
    externalReference: string
  ): Promise<boolean> {
    try {
      if (externalReference) {
        await VentaModel.updateOne(
          { idVenta: externalReference },
          {
            $set: {
              paymentId: paymentId,
              estadoPago: "rejected",
            },
          }
        );

        console.log(`Venta ${externalReference} marcada como rechazada`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error procesando pago fallido:", error);
      return false;
    }
  }

  /**
   * Procesar notificación de pago pendiente
   */
  static async procesarPagoPendiente(
    paymentId: string,
    externalReference: string
  ): Promise<boolean> {
    try {
      if (externalReference) {
        await VentaModel.updateOne(
          { idVenta: externalReference },
          {
            $set: {
              paymentId: paymentId,
              estadoPago: "pending",
            },
          }
        );

        console.log(`Venta ${externalReference} marcada como pendiente`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error procesando pago pendiente:", error);
      return false;
    }
  }

  /**
   * Procesar webhook de MercadoPago
   */
  static async procesarWebhook(type: string, data: any): Promise<boolean> {
    try {
      if (type === "payment") {
        const paymentInfo = await payment.get({ id: data.id });

        if (paymentInfo.external_reference) {
          await VentaModel.updateOne(
            { idVenta: paymentInfo.external_reference },
            {
              $set: {
                paymentId: paymentInfo.id?.toString(),
                estadoPago: paymentInfo.status as any,
              },
            }
          );

          console.log(
            `Webhook: Venta ${paymentInfo.external_reference} actualizada con estado ${paymentInfo.status}`
          );
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error procesando webhook:", error);
      return false;
    }
  }

  /**
   * Obtener estado de pago de una venta
   */
  static async obtenerEstadoPago(ventaId: string) {
    try {
      const venta = await VentaModel.findOne({ idVenta: ventaId }).select(
        "estadoPago paymentId total compradorInfo"
      );

      if (!venta) {
        return {
          success: false,
          message: "Venta no encontrada",
        };
      }

      return {
        success: true,
        data: {
          ventaId: ventaId,
          estadoPago: venta.estadoPago || "pending",
          paymentId: venta.paymentId,
          total: venta.total,
          compradorInfo: venta.compradorInfo,
        },
      };
    } catch (error) {
      console.error("Error obteniendo estado de pago:", error);
      return {
        success: false,
        message: "Error obteniendo estado de pago",
      };
    }
  }
}