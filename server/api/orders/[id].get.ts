import { defineEventHandler, getRouterParam, createError } from 'h3'
import { getOrder } from '../../utils/orders'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing order id.' })
  }
  const order = getOrder(id)
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
  }
  return order
})
