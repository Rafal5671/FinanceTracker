import Papa from 'papaparse'
import { useTransactionStore } from '@/store/transactionStore'
import { useCategoryStore } from '@/store/categoryStore'

export function useExportCSV() {
  const { transactions } = useTransactionStore()
  const { categories }   = useCategoryStore()

  function exportCSV() {
    const rows = transactions.map((t) => {
      const category = categories.find((c) => c.id === t.categoryId)
      return {
        Date:        t.date,
        Type:        t.type,
        Amount:      t.amount.toFixed(2),
        Description: t.description,
        Category:    category?.name ?? 'Unknown',
        Recurring:   t.isRecurring ? t.recurringInterval : 'No',
      }
    })

    const csv  = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)

    const link    = document.createElement('a')
    link.href     = url
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return { exportCSV }
}