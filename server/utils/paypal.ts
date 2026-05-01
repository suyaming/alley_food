import { useRuntimeConfig } from '#imports'

interface CachedToken {
  value: string
  expiresAt: number
}

let cached: CachedToken | null = null

export function getPaypalBaseUrl(): string {
  const env = useRuntimeConfig().paypalEnv || 'sandbox'
  return env === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

async function fetchAccessToken(): Promise<CachedToken> {
  const cfg = useRuntimeConfig()
  const { paypalClientId, paypalClientSecret, paypalEnv } = cfg
  if (!paypalClientId || !paypalClientSecret) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'PayPal credentials are missing. Set NUXT_PAYPAL_CLIENT_ID / NUXT_PAYPAL_CLIENT_SECRET in your .env file.',
    })
  }
  if (paypalEnv === 'live' && /^A.{20,}$/.test(paypalClientId) === false) {
    // live PayPal client IDs are 80 chars and start with 'A'; the demo defaults
    // are also that pattern, so this is just a soft sanity hint, not a hard block.
    console.warn('[paypal] NUXT_PAYPAL_ENV=live but client_id looks unusual')
  }

  const basic = Buffer.from(
    `${paypalClientId}:${paypalClientSecret}`,
  ).toString('base64')

  const res = await $fetch<{
    access_token: string
    expires_in: number
    token_type: string
  }>(`${getPaypalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  })

  return {
    value: res.access_token,
    expiresAt: Date.now() + (res.expires_in - 60) * 1000,
  }
}

export async function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }
  cached = await fetchAccessToken()
  return cached.value
}

export async function paypalFetch<T = unknown>(
  path: string,
  init: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: unknown
    headers?: Record<string, string>
  } = {},
): Promise<T> {
  const token = await getAccessToken()
  return await $fetch<T>(`${getPaypalBaseUrl()}${path}`, {
    method: init.method ?? 'GET',
    body: init.body,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

export function formatMoney(value: number): string {
  return value.toFixed(2)
}
