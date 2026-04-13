import { create } from 'zustand'
import { getDB } from '@/db/client'
import { budgets } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { Budget } from '@/types'

interface BudgetStore {
  budgets: Budget[]
  loading: boolean
  fetch: () => Promise<void>
  add: (b: Omit<Budget, 'id'>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  budgets: [],
  loading: false,

  fetch: async () => {
    set({ loading: true })
    const db = await getDB()
    const rows = await db.select().from(budgets)
    set({ budgets: rows as Budget[], loading: false })
  },

  add: async (b) => {
    const db = await getDB()
    await db.insert(budgets).values({
      id: crypto.randomUUID(),
      ...b,
    })
    await get().fetch()
  },

  remove: async (id) => {
    const db = await getDB()
    await db.delete(budgets).where(eq(budgets.id, id))
    await get().fetch()
  },
}))