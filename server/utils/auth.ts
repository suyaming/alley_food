import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  type H3Event,
  createError,
  deleteCookie,
  getCookie,
  setCookie,
} from 'h3'
import { useRuntimeConfig } from '#imports'

const COOKIE_NAME = 'alley_admin'
const SESSION_TTL_MS = 60 * 60 * 1000 // 1h

function getSecret(): string {
  const secret = useRuntimeConfig().adminSessionSecret
  if (!secret || secret.length < 16) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'NUXT_ADMIN_SESSION_SECRET is missing or too short (>=16 chars required).',
    })
  }
  return secret
}

function signSession(expiresAt: number): string {
  const secret = getSecret()
  const sig = createHmac('sha256', secret).update(String(expiresAt)).digest('hex')
  return `${expiresAt}.${sig}`
}

function verifySession(token: string): boolean {
  const dot = token.indexOf('.')
  if (dot <= 0) return false
  const expStr = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expiresAt = Number(expStr)
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false

  const expected = createHmac('sha256', getSecret())
    .update(expStr)
    .digest('hex')
  if (sig.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    return false
  }
}

export function loginAdmin(event: H3Event, password: string): boolean {
  const expected = useRuntimeConfig().adminPassword
  if (!expected) {
    throw createError({
      statusCode: 503,
      statusMessage:
        'Admin login is not configured. Set NUXT_ADMIN_PASSWORD in .env.',
    })
  }

  // Constant-time comparison to avoid timing oracle.
  const a = Buffer.from(password)
  const b = Buffer.from(expected)
  let matches = a.length === b.length
  if (matches) {
    try {
      matches = timingSafeEqual(a, b)
    } catch {
      matches = false
    }
  }
  if (!matches) return false

  const expiresAt = Date.now() + SESSION_TTL_MS
  setCookie(event, COOKIE_NAME, signSession(expiresAt), {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
  return true
}

export function logoutAdmin(event: H3Event): void {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function isAdmin(event: H3Event): boolean {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return false
  return verifySession(token)
}

export function requireAdmin(event: H3Event): void {
  if (!isAdmin(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Admin auth required.',
    })
  }
}
