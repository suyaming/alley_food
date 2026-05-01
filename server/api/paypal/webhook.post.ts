import {
  defineEventHandler,
  getHeaders,
  readRawBody,
  setResponseStatus,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import {
  verifyPaypalWebhook,
  recordWebhookEvent,
  markWebhookProcessed,
} from '../../utils/webhook'
import { getOrder, getOrderByCaptureId, updateOrder } from '../../utils/orders'
import {
  sendCustomerOrderConfirmation,
  sendKitchenOrderAlert,
  sendRefundConfirmation,
} from '../../utils/mail'
import type { OrderRecord, OrderStatus } from '../../../shared/types'

interface PaypalWebhookEvent {
  id: string
  event_type: string
  resource_type?: string
  resource?: {
    id?: string
    status?: string
    invoice_id?: string
    custom_id?: string
    supplementary_data?: {
      related_ids?: { order_id?: string }
    }
    disputed_transactions?: Array<{
      seller_transaction_id?: string
    }>
  }
}

function findOrder(event: PaypalWebhookEvent): OrderRecord | undefined {
  const r = event.resource
  if (!r) return undefined

  const linkedOrderId = r.supplementary_data?.related_ids?.order_id
  if (linkedOrderId) {
    const found = getOrder(linkedOrderId)
    if (found) return found
  }

  const captureId = r.id
  if (captureId) {
    const byCapture = getOrderByCaptureId(captureId)
    if (byCapture) return byCapture
  }

  const dispCapture = r.disputed_transactions?.[0]?.seller_transaction_id
  if (dispCapture) {
    const byCapture = getOrderByCaptureId(dispCapture)
    if (byCapture) return byCapture
  }

  return undefined
}

async function dispatch(
  event: PaypalWebhookEvent,
): Promise<{ status: OrderStatus | 'IGNORED'; orderId?: string }> {
  const order = findOrder(event)
  if (!order) return { status: 'IGNORED' }

  switch (event.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED': {
      // Idempotent: only flip if still PENDING (capture endpoint usually wins).
      // Useful when buyer closes the tab before capture-order returns.
      if (order.status === 'PENDING') {
        const captureId = event.resource?.id
        const updated = updateOrder(order.id, {
          status: 'CAPTURED',
          captureId: captureId ?? order.captureId,
        })
        if (updated && !updated.emailSentAt) {
          try {
            await sendCustomerOrderConfirmation(updated)
            await sendKitchenOrderAlert(updated)
            updateOrder(order.id, { emailSentAt: new Date().toISOString() })
          } catch (err) {
            console.error('[webhook] email send error:', err)
          }
        }
        return { status: 'CAPTURED', orderId: order.id }
      }
      return { status: order.status, orderId: order.id }
    }
    case 'PAYMENT.CAPTURE.REFUNDED':
    case 'PAYMENT.CAPTURE.REVERSED': {
      const updated = updateOrder(order.id, { status: 'REFUNDED' })
      if (updated) {
        try {
          await sendRefundConfirmation(updated)
        } catch (err) {
          console.error('[webhook] refund email error:', err)
        }
      }
      return { status: 'REFUNDED', orderId: order.id }
    }
    case 'PAYMENT.CAPTURE.DENIED': {
      updateOrder(order.id, { status: 'FAILED' })
      return { status: 'FAILED', orderId: order.id }
    }
    case 'CUSTOMER.DISPUTE.CREATED': {
      updateOrder(order.id, { status: 'DISPUTED' })
      return { status: 'DISPUTED', orderId: order.id }
    }
    default:
      return { status: 'IGNORED', orderId: order.id }
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const webhookId = config.paypalWebhookId

  const rawBody = (await readRawBody(event)) ?? ''
  const headers = getHeaders(event)

  if (!webhookId) {
    setResponseStatus(event, 503)
    console.warn('[webhook] NUXT_PAYPAL_WEBHOOK_ID is not set; rejecting.')
    return { ok: false, reason: 'webhook-not-configured' }
  }

  const verified = await verifyPaypalWebhook({
    webhookId,
    headers,
    rawBody: typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'),
  })
  if (!verified) {
    setResponseStatus(event, 401)
    console.warn('[webhook] signature verification failed')
    return { ok: false, reason: 'signature-invalid' }
  }

  let parsed: PaypalWebhookEvent
  try {
    parsed = JSON.parse(
      typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'),
    ) as PaypalWebhookEvent
  } catch {
    setResponseStatus(event, 400)
    return { ok: false, reason: 'invalid-json' }
  }

  if (!parsed.id || !parsed.event_type) {
    setResponseStatus(event, 400)
    return { ok: false, reason: 'missing-fields' }
  }

  const isNew = recordWebhookEvent({
    id: parsed.id,
    eventType: parsed.event_type,
    resourceId: parsed.resource?.id,
    rawJson: typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'),
  })
  if (!isNew) {
    return { ok: true, status: 'duplicate', id: parsed.id }
  }

  try {
    const outcome = await dispatch(parsed)
    markWebhookProcessed(parsed.id)
    return { ok: true, ...outcome, id: parsed.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    markWebhookProcessed(parsed.id, msg)
    setResponseStatus(event, 500)
    return { ok: false, reason: 'dispatch-error', error: msg }
  }
})
