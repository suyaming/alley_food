import { computed, watch } from 'vue'
import { useState } from '#imports'
import type { CartItem, CartLine } from '../../shared/types'
import { getProduct } from '../../shared/products'

const STORAGE_KEY = 'paypal_shop_cart_v1'

function readStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (x: unknown): x is CartItem =>
          !!x &&
          typeof (x as CartItem).id === 'string' &&
          typeof (x as CartItem).quantity === 'number',
      )
      .map((x) => ({ id: x.id, quantity: Math.max(1, Math.floor(x.quantity)) }))
  } catch {
    return []
  }
}

function writeStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore quota / privacy mode errors
  }
}

export function useCart() {
  const items = useState<CartItem[]>('cart-items', () => [])
  const hydrated = useState<boolean>('cart-hydrated', () => false)

  if (import.meta.client && !hydrated.value) {
    items.value = readStorage()
    hydrated.value = true
    watch(
      items,
      (next) => {
        writeStorage(next)
      },
      { deep: true },
    )
  }

  const lines = computed<CartLine[]>(() =>
    items.value
      .map((it) => {
        const product = getProduct(it.id)
        if (!product) return null
        return {
          ...it,
          product,
          lineTotal: product.price * it.quantity,
        }
      })
      .filter((x): x is CartLine => x !== null),
  )

  const totalQty = computed(() =>
    lines.value.reduce((sum, l) => sum + l.quantity, 0),
  )

  const totalAmount = computed(() =>
    lines.value.reduce((sum, l) => sum + l.lineTotal, 0),
  )

  function add(productId: string, quantity = 1): void {
    const qty = Math.max(1, Math.floor(quantity))
    const existing = items.value.find((i) => i.id === productId)
    if (existing) {
      existing.quantity += qty
    } else {
      items.value = [...items.value, { id: productId, quantity: qty }]
    }
    if (import.meta.client) {
      const { track } = useTrack()
      track('add_to_cart', { product_id: productId, quantity: qty })
    }
  }

  function updateQty(productId: string, quantity: number): void {
    const qty = Math.max(0, Math.floor(quantity))
    if (qty === 0) {
      remove(productId)
      return
    }
    items.value = items.value.map((i) =>
      i.id === productId ? { ...i, quantity: qty } : i,
    )
  }

  function remove(productId: string): void {
    items.value = items.value.filter((i) => i.id !== productId)
  }

  function clear(): void {
    items.value = []
  }

  return {
    items,
    lines,
    totalQty,
    totalAmount,
    add,
    updateQty,
    remove,
    clear,
  }
}
