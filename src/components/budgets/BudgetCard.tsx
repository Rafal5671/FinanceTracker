import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useBudgetStore } from '@/store/budgetStore'
import { useCategoryStore } from '@/store/categoryStore'
import { useTransactionStore } from '@/store/transactionStore'
import type { Budget } from '@/types'

interface Props {
  budget: Budget
}

export default function BudgetCard({ budget }: Props) {
  const remove       = useBudgetStore((s) => s.remove)
  const { categories }   = useCategoryStore()
  const { transactions } = useTransactionStore()

  const category = categories.find((c) => c.id === budget.categoryId)

  const spent = transactions
    .filter((t) =>
      t.categoryId === budget.categoryId &&
      t.type === 'expense' &&
      new Date(t.date).getMonth() + 1 === budget.month &&
      new Date(t.date).getFullYear() === budget.year
    )
    .reduce((sum, t) => sum + t.amount, 0)

  const pct       = Math.min((spent / budget.amount) * 100, 100)
  const remaining = budget.amount - spent
  const isOver    = spent > budget.amount

  const monthLabel = new Date(budget.year, budget.month - 1).toLocaleString('en-US', {
    month: 'long',
    year:  'numeric',
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{category?.icon ?? '💸'}</span>
            <div>
              <p className="text-sm font-medium leading-none">{category?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{monthLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOver && (
              <Badge variant="destructive" className="text-xs">Over budget</Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-red-500"
              onClick={() => remove(budget.id)}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <Progress
          value={pct}
          className="h-2"
          style={{
            ['--progress-color' as string]: isOver ? '#ef4444' : category?.color,
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            <span className={isOver ? 'text-red-500 font-medium' : 'text-foreground font-medium'}>
              ${spent.toFixed(2)}
            </span>
            {' '}/ ${budget.amount.toFixed(2)}
          </span>
          <span className={isOver ? 'text-red-500' : 'text-emerald-500'}>
            {isOver
              ? `$${Math.abs(remaining).toFixed(2)} over`
              : `$${remaining.toFixed(2)} left`
            }
          </span>
        </div>
      </CardContent>
    </Card>
  )
}