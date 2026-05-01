import { useState } from '#imports'

export function useCartDrawer() {
  const isOpen = useState<boolean>('cart-drawer-open', () => false)

  function open(): void {
    isOpen.value = true
  }

  function close(): void {
    isOpen.value = false
  }

  function toggle(): void {
    isOpen.value = !isOpen.value
  }

  return { isOpen, open, close, toggle }
}
