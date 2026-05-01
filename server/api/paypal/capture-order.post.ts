import { defineEventHandler, readBody, createError } from 'h3'
import { paypalFetch } from '../../utils/paypal'
import { getOrder, updateOrder } from '../../utils/orders'
import {
  sendCustomerOrderConfirmation,
  sendKitchenOrderAlert,
} from '../../utils/mail'

interface CaptureBody {
  orderID?: string
}

interface PaypalCaptureResponse {
  id: string
  status: string
  payer?: {
    email_address?: string
    name?: { given_name?: string; surname?: string }
  }
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id: string
        status: string
        amount: { currency_code: string; value: string }
      }>
    }
  }>
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CaptureBody>(event)
  const orderID = body?.orderID

  if (!orderID) {
    throw createError({ statusCode: 400, statusMessage: 'Missing orderID.' })
  }

  const existing = getOrder(orderID)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown order.' })
  }

  const result = await paypalFetch<PaypalCaptureResponse>(
    `/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
    { method: 'POST', body: {} },
  )

  const capture = result.purchase_units?.[0]?.payments?.captures?.[0]
  const payerName = [
    result.payer?.name?.given_name,
    result.payer?.name?.surname,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  const updated = updateOrder(orderID, {
    status: result.status === 'COMPLETED' ? 'CAPTURED' : 'FAILED',
    payerEmail: result.payer?.email_address,
    payerName: payerName || undefined,
    captureId: capture?.id,
  })

  if (updated && updated.status === 'CAPTURED' && !updated.emailSentAt) {
    try {
      await sendCustomerOrderConfirmation(updated)
      await sendKitchenOrderAlert(updated)
      updateOrder(orderID, { emailSentAt: new Date().toISOString() })
    } catch (err) {
      console.error('[capture-order] mail send error:', err)
    }
  }

  return {
    id: orderID,
    status: updated?.status ?? 'FAILED',
    captureId: capture?.id,
    amount: updated?.amount,
    currency: updated?.currency,
    payerEmail: updated?.payerEmail,
    payerName: updated?.payerName,
  }
})
