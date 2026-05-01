import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import type { OrderStatus, OrderRecord } from '~~/shared/types'

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  status: text('status').$type<OrderStatus>().notNull(),
  currency: text('currency').notNull(),
  amountCents: integer('amount_cents').notNull(),
  itemsJson: text('items_json').notNull(),
  payerEmail: text('payer_email'),
  payerName: text('payer_name'),
  captureId: text('capture_id'),
  emailSentAt: text('email_sent_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const webhookEvents = sqliteTable('webhook_events', {
  id: text('id').primaryKey(),
  eventType: text('event_type').notNull(),
  resourceId: text('resource_id'),
  rawJson: text('raw_json').notNull(),
  receivedAt: text('received_at').notNull(),
  processedAt: text('processed_at'),
  errorMessage: text('error_message'),
})

export type OrderItemRow = OrderRecord['items'][number]
