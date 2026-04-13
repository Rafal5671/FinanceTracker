import type { PGlite } from '@electric-sql/pglite'

export async function runMigrations(client: PGlite) {
  await client.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id    TEXT PRIMARY KEY,
      name  TEXT NOT NULL,
      icon  TEXT NOT NULL,
      color TEXT NOT NULL,
      type  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id                 TEXT PRIMARY KEY,
      category_id        TEXT REFERENCES categories(id),
      amount             REAL NOT NULL,
      description        TEXT NOT NULL,
      date               TEXT NOT NULL,
      type               TEXT NOT NULL,
      is_recurring       INTEGER DEFAULT 0,
      recurring_interval TEXT
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id          TEXT PRIMARY KEY,
      category_id TEXT REFERENCES categories(id),
      amount      REAL NOT NULL,
      month       INTEGER NOT NULL,
      year        INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recurring_ledger (
    id                      TEXT PRIMARY KEY,
    source_transaction_id   TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    period_key              TEXT NOT NULL,
    generated_transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    UNIQUE(source_transaction_id, period_key)
  );
   ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_cancelled   INTEGER DEFAULT 0;
    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS cancelled_from TEXT;
  `)

  await seedCategories(client)
}

async function seedCategories(client: PGlite) {
  const { rows } = await client.query('SELECT id FROM categories LIMIT 1')
  if (rows.length > 0) return

  const defaults = [
    { id: '1', name: 'Food',          icon: '🍔', color: '#f97316', type: 'expense' },
    { id: '2', name: 'Transport',     icon: '🚗', color: '#3b82f6', type: 'expense' },
    { id: '3', name: 'Entertainment', icon: '🎮', color: '#8b5cf6', type: 'expense' },
    { id: '4', name: 'Health',        icon: '💊', color: '#ef4444', type: 'expense' },
    { id: '5', name: 'Housing',       icon: '🏠', color: '#06b6d4', type: 'expense' },
    { id: '6', name: 'Salary',        icon: '💰', color: '#22c55e', type: 'income'  },
  ]

  for (const c of defaults) {
    await client.query(
      'INSERT INTO categories VALUES ($1,$2,$3,$4,$5)',
      [c.id, c.name, c.icon, c.color, c.type]
    )
  }
}