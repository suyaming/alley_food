/**
 * Lightweight wrapper over Umami's `umami.track()` global. Safe to call from
 * SSR or before the Umami script has loaded — the call is silently dropped
 * when the user hasn't given analytics consent or Umami isn't configured.
 */
export type TrackProps = Record<string, string | number | boolean>

declare global {
  interface Window {
    umami?: {
      track: (
        name?: string | ((props: Record<string, unknown>) => Record<string, unknown>),
        data?: TrackProps,
      ) => void
    }
  }
}

export function useTrack() {
  function track(eventName: string, props?: TrackProps) {
    if (!import.meta.client) return
    try {
      window.umami?.track(eventName, props)
    } catch {
      // swallow — analytics must never break the UX
    }
  }

  return { track }
}
