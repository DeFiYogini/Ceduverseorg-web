import { Resend } from "resend";
import { generateKitPdf } from "./kit-pdf";
import { getBankInfo } from "./env";

const FROM_EMAIL = "Ceduverse <noreply@ceduverse.org>";
const FALLBACK_FROM = "Ceduverse <onboarding@resend.dev>";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

async function sendWithFallback(
  client: Resend,
  options: { to: string; subject: string; html: string; attachments?: { filename: string; content: Buffer }[] }
): Promise<void> {
  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    ...options,
  });

  if (error) {
    const msg = error.message || "";
    console.log(`[email] Primary send error: ${msg}`);
    const isDomainIssue = msg.includes("not verified") || msg.includes("not found") || msg.includes("Not authorized") || msg.includes("not authorized");
    if (isDomainIssue) {
      console.log("[email] Domain issue detected, retrying with fallback sender...");
      const { error: fallbackError } = await client.emails.send({
        from: FALLBACK_FROM,
        ...options,
      });
      if (fallbackError) {
        const fbMsg = fallbackError.message || "";
        if (fbMsg.includes("only send testing emails") || fbMsg.includes("verify a domain")) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[email] Resend domain not verified. Email logged for dev testing only.");
          } else {
            console.error("[email] Resend domain not verified. Cannot send emails in production.");
          }
          return;
        }
        console.error("[email] Fallback send failed:", fbMsg);
        throw new Error(`Error al enviar correo: ${fbMsg}`);
      }
      console.log(`[email] Email sent to ${options.to} via fallback sender`);
      return;
    }
    console.error("[email] Resend error:", msg);
    throw new Error(`Error al enviar correo: ${msg}`);
  }

  console.log(`[email] Email sent to ${options.to}`);
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const client = getResendClient();
  if (!client) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[email] No RESEND_API_KEY — OTP for ${to}: ${code}`);
    } else {
      console.error("[email] No RESEND_API_KEY configured. Cannot send OTP emails.");
    }
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#faf8f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#faf8f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="440" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:16px;border:1px solid rgba(0,0,0,0.06);overflow:hidden;">
          <tr>
            <td style="background-color:#1b5adf;padding:28px 32px;text-align:center;">
              ${emailLogoHtml()}
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 20px;">
              <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a1a2e;font-weight:normal;">
                Tu código de acceso
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.5;">
                Usa este código para iniciar sesión en Ceduverse. Expira en 10 minutos.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="background-color:#f3f4f6;border-radius:12px;padding:20px 32px;display:inline-block;">
                      <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:bold;letter-spacing:8px;color:#1b5adf;">
                        ${code}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;text-align:center;">
                Si no solicitaste este código, puedes ignorar este correo.
              </p>
            </td>
          </tr>
          ${emailFooterHtml()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await sendWithFallback(client, {
      to,
      subject: `${code} — Tu código de acceso a Ceduverse`,
      html,
    });
  } catch (err: any) {
    if (err.message?.startsWith("Error al enviar")) throw err;
    console.error("[email] Unexpected error:", err.message);
    throw new Error("No se pudo enviar el correo. Intenta de nuevo.");
  }
}

export async function sendKitEmail(to: string, fullName: string): Promise<void> {
  const client = getResendClient();
  if (!client) {
    console.log(`[email] No RESEND_API_KEY — Kit email for ${to} (${fullName}) skipped`);
    return;
  }

  console.log(`[email] Generating Kit PDF for ${fullName}...`);
  const pdfBuffer = await generateKitPdf(fullName);
  console.log(`[email] Kit PDF generated (${(pdfBuffer.length / 1024).toFixed(0)} KB)`);

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#faf8f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#faf8f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:16px;border:1px solid rgba(0,0,0,0.06);overflow:hidden;">
          <tr>
            <td style="background-color:#1b5adf;padding:28px 32px;text-align:center;">
              ${emailLogoHtml()}
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 20px;">
              <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a1a2e;font-weight:normal;">
                ¡Hola, ${escapeHtml(fullName.split(" ")[0])}!
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                Aquí tienes tu <strong style="color:#1a1a2e;">Kit Cooperativista + Reforma Fiscal 2026</strong>. Lo encontrarás adjunto como PDF en este correo.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#f0f7ff;border-radius:12px;padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:bold;color:#1b5adf;">¿Qué incluye tu Kit?</p>
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      ${kitItem("Marco legal completo (LGSC, LISR, LFT)")}
                      ${kitItem("Guía de la Reforma Fiscal 2026")}
                      ${kitItem("Los 3 niveles de certificación y precios")}
                      ${kitItem("Tutor IA: cómo funciona la personalización")}
                      ${kitItem("Catálogo de 78 cursos (29 STPS + 49 IA)")}
                      ${kitItem("Planes, precios y comparativa de ahorro")}
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#f0fdf4;border-radius:12px;padding:20px 24px;">
                    <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#00b87a;">Próximo paso</p>
                    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">
                      Agenda una demo personalizada para ver cómo el modelo cooperativista puede reducir costos de capacitación en tu empresa hasta un 70%.
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://ceduverse.org/empresas" style="display:inline-block;background-color:#f28023;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 36px;border-radius:50px;letter-spacing:0.5px;">
                      VER PLANES PARA EMPRESAS
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;text-align:center;">
                ¿Tienes dudas? Responde a este correo y te ayudamos.
              </p>
            </td>
          </tr>
          ${emailFooterHtml()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await sendWithFallback(client, {
      to,
      subject: "Tu Kit Cooperativista + Reforma Fiscal 2026 — Ceduverse",
      html,
      attachments: [
        {
          filename: "Kit-Cooperativista-Ceduverse-2026.pdf",
          content: pdfBuffer,
        },
      ],
    });
    console.log(`[email] Kit email sent to ${to} with PDF attachment`);
  } catch (err: any) {
    if (err.message?.startsWith("Error al enviar")) throw err;
    console.error("[email] Kit email error:", err.message);
    throw new Error("No se pudo enviar el Kit por correo. Intenta de nuevo.");
  }
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function fmtMXN(val: string | number): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(val));
}

export interface SamConfirmationData {
  periodYear: number;
  periodMonth: number;
  planType: string;
  collaborators: number;
  grossAmount: string | number;
  feeAmount: string | number;
  feePercentage: string | number;
  netToCooperative: string | number;
  hash: string;
  confirmedAt: string;
  confirmedByName: string;
}

const BANK_INFO_EMAIL = getBankInfo();

export async function sendSamConfirmationEmail(to: string, data: SamConfirmationData): Promise<void> {
  const client = getResendClient();
  if (!client) {
    console.log(`[email] No RESEND_API_KEY — SAM confirmation email for ${to} skipped`);
    return;
  }

  const monthName = MONTH_NAMES[(data.periodMonth || 1) - 1];
  const paymentRef = `SAM-${data.periodYear}${String(data.periodMonth).padStart(2, "0")}`;
  const planNames: Record<string, string> = { impulsa: "Impulsa", transforma: "Transforma", lidera: "Lidera" };
  const planLabel = planNames[data.planType] || data.planType;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#faf8f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#faf8f4;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="520" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:16px;border:1px solid rgba(0,0,0,0.06);overflow:hidden;">
        <tr><td style="background-color:#1b5adf;padding:28px 32px;text-align:center;">${emailLogoHtml()}</td></tr>
        <tr><td style="padding:36px 32px 20px;">
          <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a1a2e;font-weight:normal;">
            Aportación Confirmada
          </h1>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.5;">
            La aportación mensual de <strong>${escapeHtml(monthName)} ${data.periodYear}</strong> ha sido confirmada exitosamente.
          </p>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
            <tr><td style="background-color:#f0f7ff;border-radius:12px;padding:20px 24px;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:bold;color:#1b5adf;">Resumen de la aportación</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="4">
                <tr><td style="font-size:13px;color:#6b7280;width:50%;">Plan:</td><td style="font-size:13px;color:#1a1a2e;font-weight:600;">${escapeHtml(planLabel)}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">Colaboradores:</td><td style="font-size:13px;color:#1a1a2e;font-weight:600;">${data.collaborators}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">Total mensual:</td><td style="font-size:13px;color:#1a1a2e;font-weight:600;">${fmtMXN(data.grossAmount)}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">Fee de administración (${data.feePercentage}%):</td><td style="font-size:13px;color:#f28023;font-weight:600;">${fmtMXN(data.feeAmount)}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">Neto a cooperativa:</td><td style="font-size:13px;color:#00b87a;font-weight:600;">${fmtMXN(data.netToCooperative)}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">Confirmada por:</td><td style="font-size:13px;color:#1a1a2e;">${escapeHtml(data.confirmedByName)}</td></tr>
              </table>
            </td></tr>
          </table>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
            <tr><td style="background-color:#f0fdf4;border-radius:12px;padding:16px 24px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:bold;color:#00b87a;">Hash de integridad (SHA-256)</p>
              <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;color:#374151;word-break:break-all;background-color:#e6f7ed;padding:8px 12px;border-radius:6px;">
                ${escapeHtml(data.hash)}
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">Este hash certifica la integridad del documento de confirmación conforme al Art. 89 Bis del Código de Comercio.</p>
            </td></tr>
          </table>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
            <tr><td style="background-color:#fff7ed;border-radius:12px;padding:20px 24px;border:1px solid #fed7aa;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:bold;color:#f28023;">Datos para transferencia</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="4">
                <tr><td style="font-size:13px;color:#6b7280;width:40%;">Banco:</td><td style="font-size:13px;color:#1a1a2e;font-weight:600;">${BANK_INFO_EMAIL.bank}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">Beneficiario:</td><td style="font-size:13px;color:#1a1a2e;font-weight:600;">${BANK_INFO_EMAIL.beneficiary}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">CLABE:</td><td style="font-family:'Courier New',monospace;font-size:13px;color:#1a1a2e;font-weight:600;">${BANK_INFO_EMAIL.clabe}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">Referencia:</td><td style="font-size:13px;color:#1a1a2e;font-weight:600;">${escapeHtml(paymentRef)}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">Monto:</td><td style="font-size:13px;color:#1b5adf;font-weight:bold;">${fmtMXN(data.grossAmount)}</td></tr>
              </table>
            </td></tr>
          </table>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
            <tr><td style="background-color:#fef2f2;border-radius:12px;padding:14px 24px;border:1px solid #fecaca;">
              <p style="margin:0;font-size:13px;color:#b91c1c;font-weight:600;">
                ⚠ Fecha límite de pago: <strong>día 15 de ${escapeHtml(monthName)} ${data.periodYear}</strong>
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:#dc2626;">Realiza la transferencia antes de esta fecha para evitar la suspensión del servicio.</p>
            </td></tr>
          </table>

          <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;text-align:center;">
            Este correo es una constancia digital de tu confirmación. Conserva el hash como referencia.
          </p>
        </td></tr>
        ${emailFooterHtml()}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await sendWithFallback(client, {
      to,
      subject: `Aportación ${monthName} ${data.periodYear} confirmada — Ceduverse SAM`,
      html,
    });
    console.log(`[email] SAM confirmation email sent to ${to}`);
  } catch (err: any) {
    console.error("[email] SAM confirmation email error:", err.message);
  }
}

export async function sendSamReminderEmail(
  to: string,
  monthName: string,
  periodYear: number,
  amount: string | number,
  daysSinceGenerated: number,
  isSecondReminder: boolean,
): Promise<void> {
  const client = getResendClient();
  if (!client) {
    console.log(`[email] No RESEND_API_KEY — SAM reminder for ${to} skipped`);
    return;
  }

  const urgencyColor = isSecondReminder ? "#b91c1c" : "#f28023";
  const urgencyBg = isSecondReminder ? "#fef2f2" : "#fff7ed";
  const urgencyBorder = isSecondReminder ? "#fecaca" : "#fed7aa";
  const title = isSecondReminder ? "Segundo Recordatorio — Aportación Pendiente" : "Recordatorio — Aportación Pendiente";

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#faf8f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#faf8f4;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:16px;border:1px solid rgba(0,0,0,0.06);overflow:hidden;">
        <tr><td style="background-color:${urgencyColor};padding:28px 32px;text-align:center;">${emailLogoHtml()}</td></tr>
        <tr><td style="padding:36px 32px 20px;">
          <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a1a2e;font-weight:normal;">${title}</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.5;">
            La aportación de <strong>${escapeHtml(monthName)} ${periodYear}</strong> por <strong>${fmtMXN(amount)}</strong> lleva <strong>${daysSinceGenerated} días</strong> sin confirmar.
          </p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
            <tr><td style="background-color:${urgencyBg};border-radius:12px;padding:16px 24px;border:1px solid ${urgencyBorder};">
              <p style="margin:0;font-size:13px;color:${urgencyColor};font-weight:600;">
                ${isSecondReminder
                  ? "⚠ Último aviso: Si la aportación no se confirma, se notificará a tu socio comercial y podría afectar la continuidad del servicio."
                  : "Ingresa a tu panel de empresa en Ceduverse para revisar y confirmar la aportación pendiente."}
              </p>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td align="center">
              <a href="https://ceduverse.org/empresa" style="display:inline-block;background-color:#1b5adf;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 36px;border-radius:50px;">
                IR A MI PANEL
              </a>
            </td></tr>
          </table>
        </td></tr>
        ${emailFooterHtml()}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await sendWithFallback(client, {
      to,
      subject: `${isSecondReminder ? "⚠ " : ""}Recordatorio: Aportación ${monthName} ${periodYear} pendiente — Ceduverse`,
      html,
    });
    console.log(`[email] SAM reminder (${isSecondReminder ? "2nd" : "1st"}) sent to ${to}`);
  } catch (err: any) {
    console.error("[email] SAM reminder email error:", err.message);
  }
}

export async function sendSamPartnerNotificationEmail(
  to: string,
  companyName: string,
  monthName: string,
  periodYear: number,
  amount: string | number,
  daysSinceGenerated: number,
): Promise<void> {
  const client = getResendClient();
  if (!client) {
    console.log(`[email] No RESEND_API_KEY — SAM partner notification for ${to} skipped`);
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
        <tr><td style="background-color:#7c3aed;padding:28px 32px;text-align:center;">${emailLogoHtml()}</td></tr>
        <tr><td style="padding:36px 32px 20px;">
          <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a1a2e;font-weight:normal;">Alerta de Aportación Pendiente</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.5;">
            La empresa <strong>${escapeHtml(companyName)}</strong> tiene una aportación pendiente de confirmación por <strong>${daysSinceGenerated} días</strong>.
          </p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
            <tr><td style="background-color:#f5f3ff;border-radius:12px;padding:16px 24px;border:1px solid #e9d5ff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="4">
                <tr><td style="font-size:13px;color:#6b7280;width:40%;">Periodo:</td><td style="font-size:13px;color:#1a1a2e;font-weight:600;">${escapeHtml(monthName)} ${periodYear}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">Monto:</td><td style="font-size:13px;color:#1a1a2e;font-weight:600;">${fmtMXN(amount)}</td></tr>
                <tr><td style="font-size:13px;color:#6b7280;">Días pendiente:</td><td style="font-size:13px;color:#b91c1c;font-weight:600;">${daysSinceGenerated} días</td></tr>
              </table>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
            Te sugerimos contactar a la empresa para dar seguimiento. Puedes revisar el estatus desde tu panel de socio.
          </p>
        </td></tr>
        ${emailFooterHtml()}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await sendWithFallback(client, {
      to,
      subject: `Alerta: ${companyName} — Aportación ${monthName} ${periodYear} sin confirmar`,
      html,
    });
    console.log(`[email] SAM partner notification sent to ${to}`);
  } catch (err: any) {
    console.error("[email] SAM partner notification email error:", err.message);
  }
}

export async function sendEmployeeInvitationEmail(
  to: string,
  nombre: string,
  companyName: string,
  inviteUrl: string,
): Promise<void> {
  const client = getResendClient();
  if (!client) {
    console.log(`[email] No RESEND_API_KEY — Invitation email for ${to} (${nombre}) skipped`);
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
        <tr><td style="background-color:#1b5adf;padding:28px 32px;text-align:center;">${emailLogoHtml()}</td></tr>
        <tr><td style="padding:36px 32px 20px;">
          <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1a1a2e;font-weight:normal;">
            ¡Hola, ${escapeHtml(nombre)}!
          </h1>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
            <strong style="color:#1a1a2e;">${escapeHtml(companyName)}</strong> te ha invitado a unirte a su programa de capacitación en <strong>Ceduverse</strong>.
          </p>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
            <tr><td style="background-color:#f0f7ff;border-radius:12px;padding:20px 24px;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:bold;color:#1b5adf;">¿Qué obtienes?</p>
              <table role="presentation" cellspacing="0" cellpadding="0">
                ${kitItem("Acceso a cursos de capacitación certificados")}
                ${kitItem("Certificaciones DC-3 reconocidas por la STPS")}
                ${kitItem("Tu propio espacio de aprendizaje personalizado")}
                ${kitItem("Seguimiento de tu progreso y logros")}
              </table>
            </td></tr>
          </table>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
            <tr><td align="center">
              <a href="${escapeHtml(inviteUrl)}" style="display:inline-block;background-color:#1b5adf;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 36px;border-radius:50px;letter-spacing:0.5px;">
                REGISTRARME AHORA
              </a>
            </td></tr>
          </table>

          <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;text-align:center;">
            Si no esperabas esta invitación, puedes ignorar este correo.
          </p>
        </td></tr>
        ${emailFooterHtml()}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await sendWithFallback(client, {
      to,
      subject: `${companyName} te invita a Ceduverse — Regístrate aquí`,
      html,
    });
    console.log(`[email] Invitation email sent to ${to}`);
  } catch (err: any) {
    console.error("[email] Invitation email error:", err.message);
  }
}

function emailLogoHtml(): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
    <tr>
      <td style="width:36px;height:36px;background-color:rgba(255,255,255,0.2);border-radius:10px;text-align:center;vertical-align:middle;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#ffffff;font-weight:bold;">
        C
      </td>
      <td style="padding-left:10px;font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#ffffff;letter-spacing:-0.5px;">
        Cedu<em style="font-style:normal;">verse</em>
      </td>
    </tr>
  </table>`;
}

function emailFooterHtml(): string {
  return `<tr>
    <td style="padding:0 32px 28px;">
      <hr style="border:none;border-top:1px solid rgba(0,0,0,0.06);margin:0 0 20px;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.5;">
        Ceduverse — Capacitación laboral inteligente para América Latina
      </p>
    </td>
  </tr>`;
}

function kitItem(text: string): string {
  return `<tr>
    <td style="padding:3px 0;font-size:13px;color:#374151;line-height:1.4;">
      ✓ ${escapeHtml(text)}
    </td>
  </tr>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
