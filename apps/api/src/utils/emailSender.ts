import { Resend } from "resend"
import { Order, OrderLine, Tax } from "../order/orderModel.ts"
const resend = new Resend("re_5p8exeLt_6r7WpSjoreg5jBT4qtAhwRhZ")
// This var must NOT be here!

export const thanksForYourPurchase = async (order: Order) => {
  try {
    const emailHtml = createOrderTemplate(order)

    const { data, error } = await resend.emails.send({
      from: "prixers@prixelart.com",
      to: [order?.consumerDetails?.basic?.email!],
      subject: `|Prixelart| Gracias por comprar ${order?.consumerDetails?.basic?.name} ${order?.consumerDetails?.basic?.lastName}!`,
      html: emailHtml,
    })

    if (error) {
      console.error("Error al enviar el correo:", error)
      return { success: false, error }
    }

    console.log("Correo enviado exitosamente:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Excepción al enviar el correo:", error)
    return { success: false, error }
  }
}

const createOrderTemplate = (order: Order): string => {
  const formatSelectionDetails = (line: OrderLine): string => {
    if (!line.item.product.selection || line.item.product.selection.length === 0) {
      return '';
    }
    const details = line.item.product.selection
      .map(attr => `${attr.name}: ${attr.value}`)
      .join(', ');
    return `<br><small style="color: #333333;">Selección: ${details}</small>`;
  };

  const generateProductLines = (lines: OrderLine[]): string => {
    return lines.map(line => `
      <tr class="product-row">
        <td>
          <strong>${line.item.product.name}</strong>
          ${line.item.art && 'title' in line.item.art ? `<br><small style="color: #333333;">Arte: ${line.item.art.title}</small>` : ''}
          ${formatSelectionDetails(line)}
        </td>
        <td style="text-align: center;">${line.quantity}</td>
        <td style="text-align: right;">$${line.subtotal.toFixed(2)}</td>
      </tr>
    `).join('');
  };

  const generateTaxLines = (taxes: Tax[]): string => {
    return taxes.map(tax => `
      <tr>
        <td style="text-align: right; padding-right: 20px;">${tax.name}:</td>
        <td style="text-align: right;">$${tax.amount.toFixed(2)}</td>
      </tr>
    `).join('');
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Confirmación de Compra</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        table { border-spacing: 0; width: 100%; }
        td { padding: 0; }
        img { border: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f4; padding: 40px 0; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: Arial, Helvetica, sans-serif; color: #333333; }
        .content-header { text-align: center; background-color: #d33f49; padding: 40px; }
        .content-header h2 { color: #fefefe; font-family: 'Arial Black', Gadget, sans-serif; margin: 0; }
        .content-header p { color: #fefefe; }
        .details-section { padding: 20px 30px; }
        .details-section h3 { margin-top: 0; text-align: center; color: #000000; }
        .product-table { margin-bottom: 20px; }
        .product-table th { text-align: left; padding-bottom: 10px; border-bottom: 2px solid #eeeeee; color: #000000; }
        .product-row td { padding: 10px 0; border-bottom: 1px solid #eeeeee; }
        .totals-table { width: 100%; max-width: 300px; float: right; }
        .totals-table td { padding: 5px 0; }
        .totals-table .total-row td { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; color: #000000; }
        .shipping-info { padding: 20px 30px; background-color: #f8f8f8; }
        .clearfix::after { content: ""; clear: both; display: table; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <table class="main" align="center">
          
          <tr>
            <td style="padding: 21px 0;" valign="top" align="center">
              <img class="max-width" border="0" style="display:block; color:#d33f49; max-width:18% !important; width:18%; height:auto !important;" width="108" alt="Logo de la empresa" src="http://cdn.mcauto-images-production.sendgrid.net/6d0762ca48740808/c3f84613-06ad-41d7-a17c-f331f1c25714/326x396.png">
            </td>
          </tr>

          <tr>
            <td>
              <div class="content-header">
                <h2>¡Gracias por tu compra, ${order.consumerDetails?.basic?.name} ${order.consumerDetails?.basic?.lastName}!</h2>
                <p>Hemos recibido tu pedido #${order._id?.toString().slice(-6)} y ya lo estamos preparando. Aquí tienes el resumen:</p>
              </div>
            </td>
          </tr>

          <tr>
            <td class="details-section">
              <h3>Resumen de tu Pedido</h3>
              <table class="product-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="text-align: center;">Cantidad</th>
                    <th style="text-align: right;">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  ${generateProductLines(order.lines)}
                </tbody>
              </table>

              <div class="clearfix">
                <table class="totals-table">
                  <tbody>
                    <tr>
                      <td style="text-align: right; padding-right: 20px;">Subtotal:</td>
                      <td style="text-align: right;">$${order.subTotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="text-align: right; padding-right: 20px;">Envío (${order.shipping.method.name}):</td>
                      <td style="text-align: right;">$${(order.shippingCost || 0).toFixed(2)}</td>
                    </tr>
                    ${generateTaxLines(order.tax)}
                    <tr class="total-row">
                      <td style="text-align: right; padding-right: 20px;">Total:</td>
                      <td style="text-align: right;">$${order.total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
};

const forgotPasswordTemplate = (recoveryUrl: string): string => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Recupera tu contraseña</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        -webkit-font-smoothing: antialiased;
      }
      table {
        border-spacing: 0;
      }
      td {
        padding: 0;
      }
      img {
        border: 0;
      }
      .wrapper {
        width: 100%;
        table-layout: fixed;
        background-color: #f4f4f4;
        padding-bottom: 60px;
      }
      .main {
        background-color: #ffffff;
        margin: 0 auto;
        width: 100%;
        max-width: 600px;
        border-spacing: 0;
        font-family: Arial, Helvetica, sans-serif;
        color: #171a1b;
      }
      
      .button-hover:hover {
        background-color: #b8333d !important;
        border-color: #b8333d !important;
      }

      @media (prefers-color-scheme: dark) {
        body, .wrapper {
          background-color: #2d2d2d !important;
        }
        .main {
          background-color: #3d3d3d !important;
          color: #ffffff !important;
        }
        .footer-link {
          color: #aaaaaa !important;
        }
      }
    </style>
  </head>
  <body>
    <center class="wrapper">
      <table class="main" align="center">
        
        <tr>
          <td style="padding: 21px 0;" align="center">
            <img width="108" alt="Logo Prixelart" src="http://cdn.mcauto-images-production.sendgrid.net/6d0762ca48740808/c3f84613-06ad-41d7-a17c-f331f1c25714/326x396.png">
          </td>
        </tr>
        <tr>
          <td style="background-color: #d33f49; padding: 20px; text-align: center;">
            <h1 style="font-size: 28px; font-family: 'Arial Black', Gadget, sans-serif; color: #ffffff; margin: 0;">
              ¡Pronto estarás listo!
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 30px 30px 30px; text-align: center;">
            <p style="font-size: 16px; line-height: 24px; color: #555555; margin: 0;">
              Solo haz clic en el siguiente botón para restablecer tu contraseña y continuar compartiendo tu creación con el mundo.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding: 0 30px 40px 30px; text-align: center;">
            <table align="center" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td align="center" style="border-radius: 6px;" bgcolor="#d33f49">
                    <a href="${recoveryUrl}" target="_blank" class="button-hover" style="font-size: 16px; font-family: 'Arial Black', Helvetica, sans-serif; font-weight: bold; color: #ffffff; text-decoration: none; display: block; padding: 15px 25px; border-radius: 6px; border: 1px solid #d33f49;">
                      Recuperar contraseña
                    </a>
                  </td>
                </tr>
              </table>
            </td>
        </tr>

        <tr>
          <td style="padding-bottom: 20px; text-align: center;">
            <p style="font-size: 12px; color: #888888; margin: 0;">
              ¿El correo no se muestra completo? 
              <a href="#" target="_blank" class="footer-link" style="color: #888888;">Ver en el navegador</a>
            </p>
          </td>
        </tr>

      </table>
    </center>
  </body>
  </html>
  `
}

export const forgotPassword = async (email: string, recoveryUrl: string) => {
  try {
    const emailHtml = forgotPasswordTemplate(recoveryUrl)
    const { data, error } = await resend.emails.send({
      from: "prixers@prixelart.com",
      to: [email],
      subject: `|Prixelart| Recupera tu contraseña aquí!`,
      html: emailHtml,
    })

    if (error) {
      console.error("Error al enviar el correo:", error)
      return { success: false, error }
    }

    console.log("Correo enviado exitosamente:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Excepción al enviar el correo:", error)
    return { success: false, error }
  }
}
