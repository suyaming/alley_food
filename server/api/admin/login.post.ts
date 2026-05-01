import { defineEventHandler, readBody, createError } from 'h3'
import { loginAdmin } from '../../utils/auth'

interface LoginBody {
  password?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBody>(event)
  const password = String(body?.password ?? '')

  if (!password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing password.' })
  }

  const ok = loginAdmin(event, password)
  if (!ok) {
    // Same response shape for both bad-password and rate-limited paths.
    throw createError({ statusCode: 401, statusMessage: 'Invalid password.' })
  }

  return { ok: true }
})
