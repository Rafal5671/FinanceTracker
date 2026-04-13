import { create } from 'zustand'
import { getDB } from '@/db/client'
import { transactions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { Transaction } from '@/types'
import { generateRecurringTransactions } from '@/db/recurringGenerator'

interface TransactionStore {
  transactions: Transaction[]
  loading: boolean
  init: () => Promise<void>
  fetch: () => Promise<void>
  add: (t: Omit<Transaction, 'id'>) => Promise<void>
  remove: (id: string) => Promise<void>
  cancel: (id: string, fromDate?: string) => Promise<void>
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loading: false,

  init: async () => {
    await generateRecurringTransactions()
    await get().fetch()
  },

  fetch: async () => {
    set({ loading: true })
    const db = await getDB()
    const rows = await db.select().from(transactions)
    set({ transactions: rows as Transaction[], loading: false })
  },

  add: async (t) => {
    const db = await getDB()
    await db.insert(transactions).values({
      id: crypto.randomUUID(),
      ...t,
    })
    await get().fetch()
  },

  remove: async (id) => {
    const db = await getDB()
    await db.delete(transactions).where(eq(transactions.id, id))
    await get().fetch()
  },

  cancel: async (id: string, fromDate?: string) => {
    const db = await getDB()
    await db
      .update(transactions)
      .set({
        isCancelled:   1,
        cancelledFrom: fromDate ?? new Date().toISOString().split('T')[0],
      })
      .where(eq(transactions.id, id))
    await get().fetch()
  },
}))