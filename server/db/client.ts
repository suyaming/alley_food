import { existsSync, mkdirSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema'

let _db: BetterSQLite3Database<typeof schema> | null = null
let _sqlite: Database.Database | null = null

function resolveDbPath(): string {
  const raw = process.env.DATABASE_URL || './data/orders.db'
  return isAbsolute(raw) ? raw : resolve(process.cwd(), raw)
}

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (_db) return _db
  const dbPath = resolveDbPath()
  const dbDir = dirname(dbPath)
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })

  _sqlite = new Database(dbPath)
  _sqlite.pragma('journal_mode = WAL')
  _sqlite.pragma('foreign_keys = ON')

  _db = drizzle(_sqlite, { schema })

  const migrationsFolder = resolve(process.cwd(), 'migrations')
  if (existsSync(migrationsFolder)) {
    try {
      migrate(_db, { migrationsFolder })
    } catch (err) {
      console.error('[db] migration error:', err)
    }
  }

  return _db
}

export function closeDb(): void {
  if (_sqlite) {
    _sqlite.close()
    _sqlite = null
    _db = null
  }
}

export { schema }
