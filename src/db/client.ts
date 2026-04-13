import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import * as schema from './schema'
import { runMigrations } from './migrations'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export async function getDB() {
  if (!_db) {
    const client = await PGlite.create('idb://finance-tracker')
    await runMigrations(client)
    _db = drizzle(client, { schema })
  }
  return _db
}