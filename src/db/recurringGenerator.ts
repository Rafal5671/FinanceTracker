import { getDB } from '@/db/client'
import { transactions, recurringLedger } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import type { Transaction, RecurringInterval } from '@/types'

let runningPromise: Promise<void> | null = null

export async function generateRecurringTransactions(): Promise<void> {
  if (runningPromise) return runningPromise
  runningPromise = _generate().finally(() => { runningPromise = null })
  return runningPromise
}

export function getPeriodKey(date: Date, interval: RecurringInterval): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')

  switch (interval) {
    case 'daily':
      return `${y}-${m}-${d}`
    case 'weekly': {
      const jan4 = new Date(y, 0, 4)
      const weekNo = Math.ceil(
        ((date.getTime() - jan4.getTime()) / 86400000 + jan4.getDay() + 1) / 7
      )
      return `${y}-W${String(weekNo).padStart(2, '0')}`
    }
    case 'monthly':
      return `${y}-${m}`
    case 'yearly':
      return `${y}`
  }
}

function getOccurrencesSince(
  startDate: Date,
  interval: RecurringInterval,
  today: Date
): Date[] {
  const dates: Date[] = []
  const cursor = new Date(startDate)

  while (cursor <= today) {
    dates.push(new Date(cursor))
    switch (interval) {
      case 'daily':   cursor.setDate(cursor.getDate() + 1); break
      case 'weekly':  cursor.setDate(cursor.getDate() + 7); break
      case 'monthly': cursor.setMonth(cursor.getMonth() + 1); break
      case 'yearly':  cursor.setFullYear(cursor.getFullYear() + 1); break
    }
  }

  return dates
}

async function _generate(): Promise<void> {
  const db = await getDB()

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const sources = await db
    .select()
    .from(transactions)
    .where(eq(transactions.isRecurring, 1)) as Transaction[]

  for (const source of sources) {
    if (!source.recurringInterval) continue

    const interval  = source.recurringInterval
    const startDate = new Date(source.date)
    let endDate: Date

    if (source.isCancelled && source.cancelledFrom) {
      const cancelDate = new Date(source.cancelledFrom)
      cancelDate.setHours(23, 59, 59, 999)
      endDate = cancelDate < today ? cancelDate : cancelDate
    } else if (source.isCancelled) {
      continue
    } else {
      endDate = today
    }

    const occurrences    = getOccurrencesSince(startDate, interval, endDate)
    const sourcePeriodKey = getPeriodKey(startDate, interval)

    for (const occDate of occurrences) {
      const periodKey = getPeriodKey(occDate, interval)
      const dateStr   = occDate.toISOString().split('T')[0]

      if (periodKey === sourcePeriodKey) continue

      try {
        const existing = await db
          .select()
          .from(recurringLedger)
          .where(
            and(
              eq(recurringLedger.sourceTransactionId, source.id),
              eq(recurringLedger.periodKey, periodKey)
            )
          )
          .limit(1)

        if (existing.length > 0) continue

        const newId    = crypto.randomUUID()
        const ledgerId = crypto.randomUUID()

        await db.insert(transactions).values({
          id:                newId,
          categoryId:        source.categoryId,
          amount:            source.amount,
          description:       source.description,
          date:              dateStr,
          type:              source.type,
          isRecurring:       0,
          recurringInterval: null,
          isCancelled:       0,
          cancelledFrom:     null,
        })

        await db.insert(recurringLedger).values({
          id:                     ledgerId,
          sourceTransactionId:    source.id,
          periodKey,
          generatedTransactionId: newId,
        })
      } catch (err: any) {
        if (!err?.message?.includes('unique') && !err?.message?.includes('UNIQUE')) {
          console.warn(`Recurring skip: ${source.id} / ${periodKey}`, err)
        }
      }
    }
  }
}