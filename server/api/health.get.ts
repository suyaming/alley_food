import { defineEventHandler, setResponseStatus } from 'h3'
import { sql } from 'drizzle-orm'
import { getDb } from '../db/client'

/**
 * Liveness + readiness probe for Docker / load balancers.
 * Touches SQLite to verify the DB file is reachable.
 */
export default defineEventHandler((event) => {
  try {
    const db = getDb()
    db.run(sql`SELECT 1`)
    return { ok: true, ts: new Date().toISOString() }
  } catch (err) {
    setResponseStatus(event, 503)
    return {
      ok: false,
      ts: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
    }
  }
})
