/**
 * Page middleware: gate admin routes behind a valid session cookie.
 * Apply via `definePageMeta({ middleware: 'admin' })`.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/admin/login')) return

  try {
    const res = await $fetch<{ authenticated: boolean }>(
      '/api/admin/session',
      { headers: useRequestHeaders(['cookie']) },
    )
    if (!res.authenticated) {
      return navigateTo(`/admin/login?next=${encodeURIComponent(to.fullPath)}`)
    }
  } catch {
    return navigateTo(`/admin/login?next=${encodeURIComponent(to.fullPath)}`)
  }
})
