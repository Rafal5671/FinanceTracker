import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTransactionStore } from '@/store/transactionStore'

export default function BalanceLineChart() {
  const { transactions } = useTransactionStore()

  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let balance = 0
  const data = sorted.map((t) => {
    balance += t.type === 'income' ? t.amount : -t.amount
    return {
      date:    new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: parseFloat(balance.toFixed(2)),
    }
  })

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          formatter={(value) =>
            typeof value === 'number'
              ? [`$${value.toFixed(2)}`, 'Balance']
              : [value, 'Balance']
          }
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}