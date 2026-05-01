/**
 * Global state for the SearchOverlay (Cmd/Ctrl-K).
 */
export function useSearchOverlay() {
  const isOpen = useState<boolean>('search-overlay-open', () => false)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  return { isOpen, open, close, toggle }
}
