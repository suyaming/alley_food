import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { getOrder } from '../../../../utils/orders'

export default defineEventHandler((event) => {
  requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id.' })
  }
  const order = getOrder(id)
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
  }
  return order
})
