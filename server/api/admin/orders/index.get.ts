import { defineEventHandler, getQuery } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { listOrders } from '../../../utils/orders'
import type { OrderStatus } from '~~/shared/types'

const VALID_STATUSES: OrderStatus[] = [
  'PENDING',
  'CAPTURED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'REFUNDED',
  'DISPUTED',
  'CANCELLED',
  'FAILED',
]

export default defineEventHandler((event) => {
  requireAdmin(event)

  const q = getQuery(event)
  const statusRaw = String(q.status ?? '').toUpperCase()
  const status =
    statusRaw && (VALID_STATUSES as string[]).includes(statusRaw)
      ? (statusRaw as OrderStatus)
      : undefined
  const limit = Math.min(200, Math.max(1, Number(q.limit) || 50))
  const offset = Math.max(0, Number(q.offset) || 0)

  const orders = listOrders({ status, limit, offset })

  return { orders, count: orders.length }
})
