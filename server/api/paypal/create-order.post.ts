import { defineEventHandler, readBody, createError } from 'h3'
import { paypalFetch, formatMoney } from '../../utils/paypal'
import { saveOrder } from '../../utils/orders'
import { getProduct } from '../../../shared/products'
import type { CartItem, OrderRecord } from '../../../shared/types'

interface CreateOrderBody {
  items?: CartItem[]
}

interface PaypalOrderResponse {
  id: string
  status: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateOrderBody>(event)
  const items = Array.isArray(body?.items) ? body!.items : []

  if (items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Cart is empty.' })
  }

  const config = useRuntimeConfig()
  const currency = config.public.paypalCurrency || 'USD'

  const lineItems: OrderRecord['items'] = []
  let total = 0

  for (const raw of items) {
    const qty = Math.max(1, Math.floor(Number(raw.quantity) || 0))
    const product = getProduct(String(raw.id))
    if (!product) {
      throw createError({
        statusCode: 400,
        statusMessage: `Unknown product: ${raw.id}`,
      })
    }
    if (product.currency !== currency) {
      throw createError({
        statusCode: 400,
        statusMessage: `Currency mismatch for ${product.id}.`,
      })
    }
    const lineTotal = product.price * qty
    total += lineTotal
    lineItems.push({
      id: product.id,
      name: product.name,
      quantity: qty,
      unitPrice: product.price,
      lineTotal,
    })
  }

  const itemTotalStr = formatMoney(total)

  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: itemTotalStr,
          breakdown: {
            item_total: { currency_code: currency, value: itemTotalStr },
          },
        },
        items: lineItems.map((li) => ({
          name: li.name.slice(0, 127),
          sku: li.id.slice(0, 127),
          quantity: String(li.quantity),
          unit_amount: {
            currency_code: currency,
            value: formatMoney(li.unitPrice),
          },
          category: 'PHYSICAL_GOODS',
        })),
      },
    ],
    application_context: {
      brand_name: 'PayPal Shop',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
    },
  }

  const result = await paypalFetch<PaypalOrderResponse>(
    '/v2/checkout/orders',
    { method: 'POST', body: orderPayload },
  )

  const now = new Date().toISOString()
  const record: OrderRecord = {
    id: result.id,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
    items: lineItems,
    currency,
    amount: total,
  }
  saveOrder(record)

  return { id: result.id }
})
