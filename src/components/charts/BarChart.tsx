import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useTransactionStore } from '@/store/transactionStore'

export default function MonthlyBarChart() {
  const { transactions } = useTransactionStore()

  const monthMap: Record<string, { income: number; expenses: number }> = {}

  transactions.forEach((t) => {
    const key = new Date(t.date).toLocaleDateString('en-US', {
      month: 'short',
      year:  '2-digit',
    })
    if (!monthMap[key]) monthMap[key] = { income: 0, expenses: 0 }
    if (t.type === 'income')  monthMap[key].income   += t.amount
    if (t.type === 'expense') monthMap[key].expenses += t.amount
  })

  const data = Object.entries(monthMap)
    .map(([month, values]) => ({ month, ...values }))
    .slice(-6)

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
        <Tooltip
          formatter={(value) =>
            typeof value === 'number'
              ? `$${value.toFixed(2)}`
              : value
          }
        />
        <Legend />
        <Bar dataKey="income"   name="Income"   fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}