import type { OrderStatus } from '~~/shared/types'

/**
 * Order status state machine. Keys are the current status, values are the
 * statuses an admin (or webhook) is allowed to transition to.
 *
 * Forward path (kitchen flow):
 *   PENDING → CAPTURED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED
 *
 * Side paths:
 *   any active state → REFUNDED (after PayPal refund)
 *   any pre-CAPTURED state → CANCELLED / FAILED
 *   DELIVERED / CAPTURED → DISPUTED (PayPal opens it via webhook)
 *   DISPUTED → CAPTURED / REFUNDED (resolution)
 *
 * Terminal states: REFUNDED, FAILED, CANCELLED.
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CAPTURED', 'CANCELLED', 'FAILED'],
  CAPTURED: ['PREPARING', 'REFUNDED', 'DISPUTED'],
  PREPARING: ['READY', 'CAPTURED', 'REFUNDED'],
  READY: ['OUT_FOR_DELIVERY', 'PREPARING', 'REFUNDED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'READY', 'REFUNDED'],
  DELIVERED: ['REFUNDED', 'DISPUTED'],
  REFUNDED: [],
  DISPUTED: ['CAPTURED', 'REFUNDED'],
  CANCELLED: [],
  FAILED: [],
}

export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function allowedTransitions(from: OrderStatus): OrderStatus[] {
  return [...(TRANSITIONS[from] ?? [])]
}

export const STATUS_ORDER: OrderStatus[] = [
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
