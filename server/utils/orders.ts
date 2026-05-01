import { eq } from 'drizzle-orm'
import type { OrderRecord } from '../../shared/types'
import { getDb } from '../db/client'
import { orders } from '../db/schema'

function toRow(order: OrderRecord) {
  return {
    id: order.id,
    status: order.status,
    currency: order.currency,
    amountCents: Math.round(order.amount * 100),
    itemsJson: JSON.stringify(order.items),
    payerEmail: order.payerEmail ?? null,
    payerName: order.payerName ?? null,
    captureId: order.captureId ?? null,
    emailSentAt: order.emailSentAt ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}

function fromRow(row: typeof orders.$inferSelect): OrderRecord {
  return {
    id: row.id,
    status: row.status,
    currency: row.currency,
    amount: row.amountCents / 100,
    items: JSON.parse(row.itemsJson) as OrderRecord['items'],
    payerEmail: row.payerEmail ?? undefined,
    payerName: row.payerName ?? undefined,
    captureId: row.captureId ?? undefined,
    emailSentAt: row.emailSentAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function saveOrder(order: OrderRecord): void {
  const db = getDb()
  db.insert(orders).values(toRow(order)).run()
}

export function updateOrder(
  id: string,
  patch: Partial<OrderRecord>,
): OrderRecord | undefined {
  const db = getDb()
  const existing = db.select().from(orders).where(eq(orders.id, id)).get()
  if (!existing) return undefined

  const next: OrderRecord = {
    ...fromRow(existing),
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  db.update(orders).set(toRow(next)).where(eq(orders.id, id)).run()
  return next
}

export function getOrder(id: string): OrderRecord | undefined {
  const db = getDb()
  const row = db.select().from(orders).where(eq(orders.id, id)).get()
  return row ? fromRow(row) : undefined
}

export function getOrderByCaptureId(captureId: string): OrderRecord | undefined {
  const db = getDb()
  const row = db
    .select()
    .from(orders)
    .where(eq(orders.captureId, captureId))
    .get()
  return row ? fromRow(row) : undefined
}

export function listOrders(options: {
  status?: OrderRecord['status']
  limit?: number
  offset?: number
} = {}): OrderRecord[] {
  const db = getDb()
  const limit = Math.max(1, Math.min(200, options.limit ?? 50))
  const offset = Math.max(0, options.offset ?? 0)
  const rows = options.status
    ? db
        .select()
        .from(orders)
        .where(eq(orders.status, options.status))
        .limit(limit)
        .offset(offset)
        .all()
    : db.select().from(orders).limit(limit).offset(offset).all()
  return rows.map(fromRow).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}
