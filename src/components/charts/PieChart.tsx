import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useCategoryStore } from '@/store/categoryStore'
import { useTransactionStore } from '@/store/transactionStore'

export default function ExpensePieChart() {
  const { transactions } = useTransactionStore()
  const { categories }   = useCategoryStore()

  const data = categories
    .filter((c) => c.type === 'expense')
    .map((c) => ({
      name:  c.name,
      value: transactions
        .filter((t) => t.categoryId === c.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      color: c.color,
    }))
    .filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No expense data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) =>
            typeof value === 'number'
              ? [`$${value.toFixed(2)}`, 'Amount']
              : [value, 'Amount']
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}