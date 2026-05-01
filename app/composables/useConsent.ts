/**
 * Cookie / analytics consent state.
 *
 * Three states:
 *   'unknown'   — no choice yet, banner is shown
 *   'essential' — user opted out of analytics; only strictly-necessary storage
 *   'all'       — user opted in to analytics
 *
 * Persisted in localStorage under 'alley_consent'. Phase 2.5 (Umami) gates
 * its <script> injection on `analyticsAllowed.value`.
 */
export type ConsentLevel = 'unknown' | 'essential' | 'all'

const STORAGE_KEY = 'alley_consent'

export function useConsent() {
  const level = useState<ConsentLevel>('consent-level', () => 'unknown')

  function load() {
    if (!import.meta.client) return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw === 'all' || raw === 'essential') {
        level.value = raw
      }
    } catch {
      // localStorage may be blocked; treat as unknown.
    }
  }

  function persist(next: ConsentLevel) {
    if (!import.meta.client) return
    try {
      if (next === 'unknown') {
        window.localStorage.removeItem(STORAGE_KEY)
      } else {
        window.localStorage.setItem(STORAGE_KEY, next)
      }
    } catch {
      // No-op when storage is unavailable.
    }
  }

  function acceptAll() {
    level.value = 'all'
    persist('all')
  }

  function acceptEssentialOnly() {
    level.value = 'essential'
    persist('essential')
  }

  function reset() {
    level.value = 'unknown'
    persist('unknown')
  }

  const analyticsAllowed = computed(() => level.value === 'all')
  const choiceMade = computed(() => level.value !== 'unknown')

  return {
    level,
    analyticsAllowed,
    choiceMade,
    load,
    acceptAll,
    acceptEssentialOnly,
    reset,
  }
}
