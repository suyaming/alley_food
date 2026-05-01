/**
 * Client-only plugin: injects Umami's tracker <script> once the visitor has
 * consented to analytics, and removes it again if they opt back out.
 *
 * Umami env (set in production):
 *   NUXT_PUBLIC_UMAMI_HOST           e.g. https://shop.example.com/umami
 *   NUXT_PUBLIC_UMAMI_WEBSITE_ID     UUID from the Umami admin panel
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const host = String(config.public.umamiHost || '').replace(/\/$/, '')
  const websiteId = String(config.public.umamiWebsiteId || '')

  if (!host || !websiteId) return

  const consent = useConsent()
  consent.load()

  const SCRIPT_ID = 'alley-umami-script'

  function inject() {
    if (document.getElementById(SCRIPT_ID)) return
    const s = document.createElement('script')
    s.id = SCRIPT_ID
    s.async = true
    s.defer = true
    s.src = `${host}/script.js`
    s.dataset.websiteId = websiteId
    s.dataset.autoTrack = 'true'
    document.head.appendChild(s)
  }

  function remove() {
    const s = document.getElementById(SCRIPT_ID)
    if (s) s.remove()
    delete window.umami
  }

  watch(
    () => consent.analyticsAllowed.value,
    (allowed) => {
      if (allowed) inject()
      else remove()
    },
    { immediate: true },
  )
})
