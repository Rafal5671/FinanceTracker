export type TransactionType = 'income' | 'expense'
export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: TransactionType
}

export interface Transaction {
  id: string
  categoryId: string
  amount: number
  description: string
  date: string
  type: TransactionType
  isRecurring: 0 | 1
  recurringInterval: RecurringInterval | null
  isCancelled: 0 | 1
  cancelledFrom: string | null
}

export interface Budget {
  id: string
  categoryId: string
  amount: number
  month: number
  year: number
}