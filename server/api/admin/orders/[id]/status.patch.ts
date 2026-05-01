import {
  defineEventHandler,
  getRouterParam,
  readBody,
  createError,
} from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { getOrder, updateOrder } from '../../../../utils/orders'
import { canTransition } from '../../../../utils/order-fsm'
import type { OrderStatus } from '../../../../../shared/types'

interface StatusBody {
  status?: OrderStatus
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing order id.' })
  }

  const body = await readBody<StatusBody>(event)
  const next = body?.status
  if (!next) {
    throw createError({ statusCode: 400, statusMessage: 'Missing status.' })
  }

  const order = getOrder(id)
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
  }

  if (order.status === next) {
    return order
  }

  if (!canTransition(order.status, next)) {
    throw createError({
      statusCode: 409,
      statusMessage: `Cannot transition ${order.status} → ${next}.`,
    })
  }

  const updated = updateOrder(id, { status: next })
  if (!updated) {
    throw createError({ statusCode: 500, statusMessage: 'Update failed.' })
  }
  return updated
})
