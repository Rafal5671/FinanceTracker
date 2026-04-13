import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useBudgetStore } from '@/store/budgetStore'
import { useCategoryStore } from '@/store/categoryStore'
import { useTransactionStore } from '@/store/transactionStore'
import BudgetCard from '@/components/budgets/BudgetCard'
import BudgetForm from '@/components/budgets/BudgetForm'

export default function Budgets() {
  const [open, setOpen]          = useState(false)
  const { budgets, fetch: fetchBudgets }       = useBudgetStore()
  const { fetch: fetchCategories }             = useCategoryStore()
  const { fetch: fetchTransactions }           = useTransactionStore()

  useEffect(() => {
    fetchBudgets()
    fetchCategories()
    fetchTransactions()
  }, [fetchBudgets, fetchCategories, fetchTransactions])

  const now          = new Date()
  const thisMonth    = budgets.filter((b) => b.month === now.getMonth() + 1 && b.year === now.getFullYear())
  const otherMonths  = budgets.filter((b) => !(b.month === now.getMonth() + 1 && b.year === now.getFullYear()))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Budgets</h2>
          <p className="text-muted-foreground text-sm mt-1">Monthly spending limits</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Add Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          No budgets yet — add your first one
        </div>
      ) : (
        <>
          {thisMonth.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">This month</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {thisMonth.map((b) => (
                  <BudgetCard key={b.id} budget={b} />
                ))}
              </div>
            </div>
          )}

          {otherMonths.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Previous months</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherMonths.map((b) => (
                  <BudgetCard key={b.id} budget={b} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <BudgetForm open={open} onClose={() => setOpen(false)} />
    </div>
  )
}