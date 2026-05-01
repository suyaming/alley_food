import {
  defineEventHandler,
  getRouterParam,
  readBody,
  createError,
} from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { getOrder, updateOrder } from '../../../../utils/orders'
import { paypalFetch, formatMoney } from '../../../../utils/paypal'
import { sendRefundConfirmation } from '../../../../utils/mail'

interface RefundBody {
  amount?: number // optional partial-refund amount; full refund when omitted
  reason?: string
}

interface PaypalRefundResponse {
  id: string
  status: string
  amount?: { currency_code: string; value: string }
}

const REFUNDABLE_STATUSES = new Set([
  'CAPTURED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'DISPUTED',
])

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing order id.' })
  }

  const body = await readBody<RefundBody>(event)
  const order = getOrder(id)
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
  }
  if (!order.captureId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Order has no PayPal capture id; cannot refund.',
    })
  }
  if (!REFUNDABLE_STATUSES.has(order.status)) {
    throw createError({
      statusCode: 409,
      statusMessage: `Cannot refund order in status ${order.status}.`,
    })
  }

  const amount =
    typeof body?.amount === 'number' && body.amount > 0
      ? Math.min(body.amount, order.amount)
      : undefined

  const payload = amount
    ? {
        amount: {
          currency_code: order.currency,
          value: formatMoney(amount),
        },
        note_to_payer: body?.reason?.slice(0, 255),
      }
    : {}

  const refund = await paypalFetch<PaypalRefundResponse>(
    `/v2/payments/captures/${encodeURIComponent(order.captureId)}/refund`,
    { method: 'POST', body: payload },
  )

  const updated = updateOrder(order.id, { status: 'REFUNDED' })

  if (updated) {
    try {
      await sendRefundConfirmation(updated)
    } catch (err) {
      console.error('[admin/refund] mail send failed:', err)
    }
  }

  return {
    ok: true,
    refundId: refund.id,
    refundStatus: refund.status,
    order: updated,
  }
})
