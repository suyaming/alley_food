import * as Sentry from '@sentry/nuxt'

const config = useRuntimeConfig()
const dsn = String(config.public.sentry?.dsn || '')

if (dsn) {
  Sentry.init({
    dsn,
    environment: String(config.public.sentry?.environment || 'production'),
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: false,
  })
}
