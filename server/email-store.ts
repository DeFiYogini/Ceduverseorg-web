import { Resend } from "resend";

const FROM_EMAIL = "Ceduverse <noreply@ceduverse.org>";
const FALLBACK_FROM = "Ceduverse <onboarding@resend.dev>";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

const fmtMXN = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderNumber: string,
  totalMxn: number,
  shippingMxn: number,
): Promise<void> {
  const client = getResendClient();
  if (!client) {
    console.log(`[email] No RESEND_API_KEY — order confirmation for ${to} skipped`);
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#faf8f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#faf8f4;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:16px;border:1px solid rgba(0,0,0,0.06);overflow:hidden;">
        <tr><td style="background-color:#00b87a;padding:28px 32px;text-align:center;">
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
            <tr>
              <td style="width:36px;height:36px;background-color:rgba(255,255,255,0.2);border-radius:10px;text-align:center;vertical-align:middle;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#ffffff;font-weight:bold;">C</td>
              <td style="padding-left:10px;font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#ffffff;letter-spacing:-0.5px;">Cedu<em style="font-style:normal;">verse</em></td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:36px 32px 20px;">
          <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a1a2e;font-weight:normal;">
            ¡Pedido confirmado!
          </h1>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
            Hola <strong>${escapeHtml(name.split(" ")[0])}</strong>, tu pago ha sido procesado exitosamente.
          </p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
            <tr><td style="background-color:#f0fdf4;border-radius:12px;padding:20px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="4">
                <tr><td style="font-size:13px;color:#6b7280;width:40%;">Pedido:</td><td style="font-size:13px;color:#1a1a2e;font-weight:600;">${escapeHtml(orderNumber)}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">Subtotal:</td><td style="font-size:13px;color:#1a1a2e;font-weight:600;">${fmtMXN(totalMxn - shippingMxn)}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">Envío:</td><td style="font-size:13px;color:#1a1a2e;font-weight:600;">${shippingMxn > 0 ? fmtMXN(shippingMxn) : "Gratis"}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">Total:</td><td style="font-size:15px;color:#00b87a;font-weight:bold;">${fmtMXN(totalMxn)}</td></tr>
              </table>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
            <tr><td style="background-color:#f0f7ff;border-radius:12px;padding:16px 24px;">
              <p style="margin:0;font-size:13px;color:#1b5adf;font-weight:600;">
                Estamos preparando tu envío. Te notificaremos cuando tu paquete esté en camino con el número de rastreo.
              </p>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td align="center">
              <a href="https://ceduverse.org/tienda" style="display:inline-block;background-color:#1b5adf;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 36px;border-radius:50px;">
                IR A LA TIENDA
              </a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;text-align:center;">
            ¿Tienes dudas sobre tu pedido? Responde a este correo.
          </p>
        </td></tr>
        <tr><td style="padding:0 32px 28px;">
          <hr style="border:none;border-top:1px solid rgba(0,0,0,0.06);margin:0 0 20px;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.5;">Ceduverse — Capacitación laboral inteligente para América Latina</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { error } = await client.emails.send({ from: FROM_EMAIL, to, subject: `Pedido ${orderNumber} confirmado — Ceduverse`, html });

  if (error) {
    const msg = error.message || "";
    if (msg.includes("not verified") || msg.includes("not found")) {
      const { error: fbErr } = await client.emails.send({ from: FALLBACK_FROM, to, subject: `Pedido ${orderNumber} confirmado — Ceduverse`, html });
      if (fbErr) console.error("[email-store] Fallback send failed:", fbErr.message);
      else console.log(`[email-store] Order confirmation sent to ${to} via fallback`);
      return;
    }
    throw new Error(msg);
  }
}
