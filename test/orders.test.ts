import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const tempDir = mkdtempSync(join(tmpdir(), 'alley-test-'))
process.env.DATABASE_URL = join(tempDir, 'test.db')

// Import AFTER env is set so the singleton picks up the temp path.
const ordersUtil = await import('../server/utils/orders')
const dbClient = await import('../server/db/client')

const { saveOrder, getOrder, getOrderByCaptureId, updateOrder, listOrders } =
  ordersUtil

beforeAll(() => {
  // Touch DB once so migrations apply.
  dbClient.getDb()
})

afterAll(() => {
  dbClient.closeDb()
  rmSync(tempDir, { recursive: true, force: true })
})

describe('server/utils/orders (SQLite-backed)', () => {
  it('saves and reads back an order', () => {
    saveOrder({
      id: 'TEST-1',
      status: 'PENDING',
      currency: 'USD',
      amount: 12.34,
      items: [
        { id: 'item-1', name: 'Test item', quantity: 2, unitPrice: 6.17, lineTotal: 12.34 },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    const loaded = getOrder('TEST-1')
    expect(loaded).toBeDefined()
    expect(loaded!.id).toBe('TEST-1')
    expect(loaded!.amount).toBeCloseTo(12.34, 2)
    expect(loaded!.items).toHaveLength(1)
    expect(loaded!.items[0]!.name).toBe('Test item')
  })

  it('updateOrder merges fields and bumps updatedAt', () => {
    saveOrder({
      id: 'TEST-2',
      status: 'PENDING',
      currency: 'USD',
      amount: 5,
      items: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    const updated = updateOrder('TEST-2', {
      status: 'CAPTURED',
      payerEmail: 'buyer@example.com',
      captureId: 'CAP-123',
    })
    expect(updated?.status).toBe('CAPTURED')
    expect(updated?.payerEmail).toBe('buyer@example.com')

    const reloaded = getOrder('TEST-2')
    expect(reloaded?.captureId).toBe('CAP-123')
    expect(reloaded?.updatedAt).not.toBe('2026-01-01T00:00:00.000Z')
  })

  it('getOrderByCaptureId looks up by capture id', () => {
    saveOrder({
      id: 'TEST-3',
      status: 'PENDING',
      currency: 'USD',
      amount: 9.9,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    updateOrder('TEST-3', { status: 'CAPTURED', captureId: 'CAP-XYZ' })

    const found = getOrderByCaptureId('CAP-XYZ')
    expect(found?.id).toBe('TEST-3')
    expect(getOrderByCaptureId('does-not-exist')).toBeUndefined()
  })

  it('listOrders filters by status and returns newest-first', () => {
    const before = listOrders().length
    const now = Date.now()
    for (let i = 0; i < 3; i++) {
      saveOrder({
        id: `LIST-${i}`,
        status: i === 0 ? 'DELIVERED' : 'PENDING',
        currency: 'USD',
        amount: 1,
        items: [],
        createdAt: new Date(now + i * 1000).toISOString(),
        updatedAt: new Date(now + i * 1000).toISOString(),
      })
    }
    const all = listOrders()
    expect(all.length).toBeGreaterThanOrEqual(before + 3)

    // Newest-first ordering check on the 3 we just inserted.
    const ours = all.filter((o) => o.id.startsWith('LIST-'))
    expect(ours[0]!.id).toBe('LIST-2')
    expect(ours[2]!.id).toBe('LIST-0')

    const delivered = listOrders({ status: 'DELIVERED' })
    expect(delivered.find((o) => o.id === 'LIST-0')).toBeDefined()
    expect(delivered.every((o) => o.status === 'DELIVERED')).toBe(true)
  })
})
