import { defineEventHandler } from 'h3'
import { logoutAdmin } from '../../utils/auth'

export default defineEventHandler((event) => {
  logoutAdmin(event)
  return { ok: true }
})
