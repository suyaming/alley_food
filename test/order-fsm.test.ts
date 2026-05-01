import { describe, it, expect } from 'vitest'
import {
  canTransition,
  allowedTransitions,
} from '../server/utils/order-fsm'

describe('order FSM', () => {
  it('allows the kitchen happy path', () => {
    expect(canTransition('PENDING', 'CAPTURED')).toBe(true)
    expect(canTransition('CAPTURED', 'PREPARING')).toBe(true)
    expect(canTransition('PREPARING', 'READY')).toBe(true)
    expect(canTransition('READY', 'OUT_FOR_DELIVERY')).toBe(true)
    expect(canTransition('OUT_FOR_DELIVERY', 'DELIVERED')).toBe(true)
  })

  it('allows refund from any post-capture state', () => {
    for (const s of [
      'CAPTURED',
      'PREPARING',
      'READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ] as const) {
      expect(canTransition(s, 'REFUNDED'), `${s} → REFUNDED`).toBe(true)
    }
  })

  it('rejects illegal transitions', () => {
    expect(canTransition('REFUNDED', 'CAPTURED')).toBe(false)
    expect(canTransition('CANCELLED', 'CAPTURED')).toBe(false)
    expect(canTransition('FAILED', 'CAPTURED')).toBe(false)
    expect(canTransition('PENDING', 'DELIVERED')).toBe(false)
    expect(canTransition('CAPTURED', 'OUT_FOR_DELIVERY')).toBe(false)
  })

  it('terminal states have no allowed transitions', () => {
    expect(allowedTransitions('REFUNDED')).toEqual([])
    expect(allowedTransitions('CANCELLED')).toEqual([])
    expect(allowedTransitions('FAILED')).toEqual([])
  })

  it('disputed state is recoverable', () => {
    expect(canTransition('DISPUTED', 'CAPTURED')).toBe(true)
    expect(canTransition('DISPUTED', 'REFUNDED')).toBe(true)
  })
})
