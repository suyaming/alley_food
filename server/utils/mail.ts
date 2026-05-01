import { useRuntimeConfig } from '#imports'
import type { OrderRecord } from '../../shared/types'

// ─── Resend client ────────────────────────────────────────────────────
// https://resend.com/docs/api-reference/emails/send-email

interface MailConfig {
  apiKey: string
  fromAddress: string
  fromName: string
  kitchenAddress: string
}

function readMailConfig(): MailConfig {
  const cfg = useRuntimeConfig()
  return {
    apiKey: cfg.resendApiKey,
    fromAddress: cfg.mailFromAddress,
    fromName: cfg.mailFromName || 'Alley Shop',
    kitchenAddress: cfg.mailKitchenAddress,
  }
}

interface SendParams {
  to: string
  subject: string
  html: string
  text: string
}

async function sendViaResend(p: SendParams): Promise<void> {
  const cfg = readMailConfig()
  if (!cfg.apiKey || !cfg.fromAddress) {
    console.warn(
      '[mail] Resend not configured (set NUXT_RESEND_API_KEY and NUXT_MAIL_FROM_ADDRESS); ' +
        `would have sent to=${p.to} subject="${p.subject}"`,
    )
    return
  }

  const fromDisplay =
    cfg.fromName && cfg.fromName !== cfg.fromAddress
      ? `${cfg.fromName} <${cfg.fromAddress}>`
      : cfg.fromAddress

  try {
    await $fetch<{ id: string }>('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        from: fromDisplay,
        to: [p.to],
        subject: p.subject,
        html: p.html,
        text: p.text,
      },
    })
  } catch (err: unknown) {
    const e = err as {
      data?: { message?: string; name?: string }
      message?: string
    }
    throw new Error(
      `Resend error: ${e?.data?.name ?? 'unknown'} — ${e?.data?.message ?? e?.message ?? 'no message'}`,
    )
  }
}

// ─── Templates ─────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function fmtMoney(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`
}

function siteUrl(): string {
  return useRuntimeConfig().siteUrl?.replace(/\/$/, '') || ''
}

const FRAME_OPEN = (titleText: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(titleText)}</title>
</head>
<body style="margin:0;padding:0;background:#F5F2ED;font-family:'Inter',system-ui,-apple-system,Segoe UI,sans-serif;color:#171715;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2ED;padding:48px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FBFAF7;border:1px solid #E5DFD3;">
      <tr><td style="padding:40px 48px 24px 48px;text-align:center;border-bottom:1px solid #E5DFD3;">
        <div style="font-family:Georgia,'Fraunces',serif;font-size:32px;font-weight:600;letter-spacing:-0.02em;color:#171715;">巷口 Alley</div>
        <div style="font-family:'Inter',sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6B6862;margin-top:8px;">Chinese street food collective</div>
      </td></tr>
      <tr><td style="padding:40px 48px;">`

const FRAME_CLOSE = (footerText: string) => `
      </td></tr>
      <tr><td style="padding:24px 48px 32px 48px;border-top:1px solid #E5DFD3;font-size:12px;line-height:1.6;color:#8A8680;text-align:center;">
        ${footerText}<br>
        <a href="${siteUrl()}" style="color:#D13B27;text-decoration:none;">${siteUrl().replace(/^https?:\/\//, '')}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`

function itemsTable(order: OrderRecord): string {
  const rows = order.items
    .map(
      (li) => `
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#171715;">
          ${escapeHtml(li.name)}
          <span style="color:#8A8680;"> × ${li.quantity}</span>
        </td>
        <td align="right" style="padding:8px 0;font-size:14px;color:#171715;font-variant-numeric:tabular-nums;">
          ${fmtMoney(li.lineTotal, order.currency)}
        </td>
      </tr>`,
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:24px 0;border-top:1px solid #E5DFD3;border-bottom:1px solid #E5DFD3;">
    ${rows}
    <tr>
      <td style="padding:14px 0 8px 0;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#6B6862;border-top:1px solid #E5DFD3;">Total</td>
      <td align="right" style="padding:14px 0 8px 0;font-size:18px;font-weight:600;color:#171715;font-variant-numeric:tabular-nums;border-top:1px solid #E5DFD3;">
        ${fmtMoney(order.amount, order.currency)}
      </td>
    </tr>
  </table>`
}

function customerHtml(order: OrderRecord): string {
  return `${FRAME_OPEN('Order received — Alley')}
    <h1 style="margin:0 0 16px 0;font-family:Georgia,'Fraunces',serif;font-size:28px;font-weight:600;letter-spacing:-0.01em;color:#171715;">Order received.</h1>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#3A3833;">
      ${order.payerName ? 'Hi ' + escapeHtml(order.payerName) + ',' : 'Hi,'} thank you for ordering from the alley.
      The kitchen has your slip and will start cooking shortly.
    </p>
    <p style="margin:0 0 8px 0;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#6B6862;">Order ${escapeHtml(order.id)}</p>
    ${itemsTable(order)}
    <p style="margin:24px 0 8px 0;font-size:14px;line-height:1.6;color:#3A3833;">
      You can track this order any time at
      <a href="${siteUrl()}/orders" style="color:#D13B27;text-decoration:underline;">${siteUrl().replace(/^https?:\/\//, '')}/orders</a>
      with the order ID above.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#3A3833;">
      Estimated cook + delivery: 35–55 minutes for local zones.
    </p>
  ${FRAME_CLOSE('A receipt for your records.')}`
}

function customerText(order: OrderRecord): string {
  const lines = order.items
    .map((li) => `  ${li.name} × ${li.quantity} — ${fmtMoney(li.lineTotal, order.currency)}`)
    .join('\n')
  return [
    `Hi${order.payerName ? ' ' + order.payerName : ''},`,
    'Thank you for ordering from the alley. The kitchen has your slip.',
    '',
    `Order ${order.id}`,
    lines,
    `Total: ${fmtMoney(order.amount, order.currency)}`,
    '',
    `Track: ${siteUrl()}/orders`,
  ].join('\n')
}

function kitchenHtml(order: OrderRecord): string {
  return `${FRAME_OPEN('New order — Alley kitchen')}
    <h1 style="margin:0 0 16px 0;font-family:Georgia,'Fraunces',serif;font-size:28px;font-weight:600;letter-spacing:-0.01em;color:#171715;">New order.</h1>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#3A3833;">
      A new order has been captured. Start cooking when ready.
    </p>
    <p style="margin:0 0 8px 0;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#6B6862;">Order ${escapeHtml(order.id)}</p>
    <p style="margin:0 0 4px 0;font-size:14px;color:#3A3833;">Customer: ${escapeHtml(order.payerName || '(unknown)')}</p>
    <p style="margin:0 0 4px 0;font-size:14px;color:#3A3833;">Email: ${escapeHtml(order.payerEmail || '(unknown)')}</p>
    ${itemsTable(order)}
    <p style="margin:16px 0 0 0;font-size:14px;line-height:1.6;color:#3A3833;">
      Open the kitchen panel to advance status:
      <a href="${siteUrl()}/admin/orders/${escapeHtml(order.id)}" style="color:#D13B27;text-decoration:underline;">${siteUrl().replace(/^https?:\/\//, '')}/admin</a>
    </p>
  ${FRAME_CLOSE('Internal kitchen alert.')}`
}

function kitchenText(order: OrderRecord): string {
  const lines = order.items
    .map((li) => `  ${li.name} × ${li.quantity}`)
    .join('\n')
  return [
    'New order captured.',
    `Order ${order.id}`,
    `Customer: ${order.payerName || '(unknown)'} <${order.payerEmail || '(unknown)'}>`,
    `Total: ${fmtMoney(order.amount, order.currency)}`,
    'Items:',
    lines,
    `Admin: ${siteUrl()}/admin/orders/${order.id}`,
  ].join('\n')
}

function refundHtml(order: OrderRecord): string {
  return `${FRAME_OPEN('Refund issued — Alley')}
    <h1 style="margin:0 0 16px 0;font-family:Georgia,'Fraunces',serif;font-size:28px;font-weight:600;letter-spacing:-0.01em;color:#171715;">Refund issued.</h1>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#3A3833;">
      ${order.payerName ? 'Hi ' + escapeHtml(order.payerName) + ',' : 'Hi,'}
      your order has been refunded. The funds will return to the original payment method
      within 3–10 business days, depending on your bank.
    </p>
    <p style="margin:0 0 8px 0;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#6B6862;">Order ${escapeHtml(order.id)}</p>
    ${itemsTable(order)}
    <p style="margin:24px 0 0 0;font-size:14px;line-height:1.6;color:#3A3833;">
      If something went wrong with the order, please reply to this email — we want to make it right.
    </p>
  ${FRAME_CLOSE('A refund confirmation for your records.')}`
}

function refundText(order: OrderRecord): string {
  return [
    `Hi${order.payerName ? ' ' + order.payerName : ''},`,
    'Your order has been refunded. Funds will return within 3-10 business days.',
    '',
    `Order ${order.id}`,
    `Refunded: ${fmtMoney(order.amount, order.currency)}`,
  ].join('\n')
}

// ─── Public API ────────────────────────────────────────────────────────

export async function sendCustomerOrderConfirmation(
  order: OrderRecord,
): Promise<void> {
  if (!order.payerEmail) {
    console.warn(`[mail] no payerEmail on order ${order.id}; skipping confirmation`)
    return
  }
  await sendViaResend({
    to: order.payerEmail,
    subject: `Order received — Alley · ${order.id.slice(-6)}`,
    html: customerHtml(order),
    text: customerText(order),
  })
}

export async function sendKitchenOrderAlert(order: OrderRecord): Promise<void> {
  const cfg = readMailConfig()
  if (!cfg.kitchenAddress) {
    console.warn(`[mail] no NUXT_MAIL_KITCHEN_ADDRESS; skipping kitchen alert for ${order.id}`)
    return
  }
  await sendViaResend({
    to: cfg.kitchenAddress,
    subject: `[NEW] ${order.id.slice(-6)} · ${fmtMoney(order.amount, order.currency)}`,
    html: kitchenHtml(order),
    text: kitchenText(order),
  })
}

export async function sendRefundConfirmation(order: OrderRecord): Promise<void> {
  if (!order.payerEmail) {
    console.warn(`[mail] no payerEmail on order ${order.id}; skipping refund email`)
    return
  }
  await sendViaResend({
    to: order.payerEmail,
    subject: `Refund issued — Alley · ${order.id.slice(-6)}`,
    html: refundHtml(order),
    text: refundText(order),
  })
}
