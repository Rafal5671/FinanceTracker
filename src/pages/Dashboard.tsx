import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from 'lucide-react'
import { useTransactionStore } from '@/store/transactionStore'
import { useCategoryStore } from '@/store/categoryStore'
import ExpensePieChart from '@/components/charts/PieChart'
import BalanceLineChart from '@/components/charts/LineChart'
import MonthlyBarChart from '@/components/charts/BarChart'
import type { Transaction } from '@/types'

export default function Dashboard() {
  const { transactions, fetch: fetchTx } = useTransactionStore()
  const { fetch: fetchCats }             = useCategoryStore()

  useEffect(() => {
    fetchTx()
    fetchCats()
  }, [fetchTx, fetchCats])

  const now      = new Date()
  const month    = now.getMonth()
  const year     = now.getFullYear()

  const thisMonth = transactions.filter((t: Transaction) => {
    const d = new Date(t.date)
    return d.getMonth() === month && d.getFullYear() === year
  })

  const income   = thisMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = thisMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance  = transactions.reduce(
    (s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0
  )

  const stats = [
    {
      label: 'Total Balance',
      value: `$${balance.toFixed(2)}`,
      sub:   'All time',
      trend: balance >= 0 ? 'up' : 'down',
      icon:  Wallet,
    },
    {
      label: 'Income',
      value: `$${income.toFixed(2)}`,
      sub:   'This month',
      trend: 'up',
      icon:  TrendingUp,
    },
    {
      label: 'Expenses',
      value: `$${expenses.toFixed(2)}`,
      sub:   'This month',
      trend: 'down',
      icon:  TrendingDown,
    },
    {
      label: 'Transactions',
      value: thisMonth.length.toString(),
      sub:   'This month',
      trend: 'neutral',
      icon:  ArrowLeftRight,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Your financial overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, trend, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                <Icon size={16} className="text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
              <p className={`text-xs mt-1 ${
                trend === 'up'
                  ? 'text-emerald-500'
                  : trend === 'down'
                  ? 'text-red-500'
                  : 'text-muted-foreground'
              }`}>
                {sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Balance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceLineChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensePieChart />
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Month to Month</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyBarChart />
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
              No transactions yet
            </div>
          ) : (
            <div className="divide-y">
              {transactions.slice(0, 5).map((t: Transaction) => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${
                    t.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}