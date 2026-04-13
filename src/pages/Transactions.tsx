import { useEffect, useState } from 'react'
import { RefreshCw, Plus, Search, Download} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTransactionStore } from '@/store/transactionStore'
import { useCategoryStore } from '@/store/categoryStore'
import { useExportCSV } from '@/hooks/useExportCSV'
import TransactionForm from '@/components/transactions/TransactionForm'
import TransactionList from '@/components/transactions/TransactionList'
import ImportCSVButton from '@/components/transactions/ImportCSVButton'

type Tab = 'all' | 'recurring'

export default function Transactions() {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const [tab, setTab]       = useState<Tab>('all')

  const { fetch: fetchTx }   = useTransactionStore()
  const { fetch: fetchCats } = useCategoryStore()
  const { exportCSV }        = useExportCSV()

  useEffect(() => {
    fetchTx()
    fetchCats()
  }, [fetchTx, fetchCats])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your income and expenses
          </p>
        </div>
        <div className="flex gap-2">
          <ImportCSVButton />
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={exportCSV}
          >
            <Download size={16} />
            Export CSV
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
            <Plus size={16} />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1 border rounded-md p-0.5">
          <Button
            size="sm"
            variant={tab === 'all' ? 'default' : 'ghost'}
            className="h-8 px-3 text-xs"
            onClick={() => setTab('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={tab === 'recurring' ? 'default' : 'ghost'}
            className="h-8 px-3 text-xs gap-1.5"
            onClick={() => setTab('recurring')}
          >
            <RefreshCw size={12} />
            Recurring
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {tab === 'recurring' ? 'Recurring Transactions' : 'All Transactions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList search={search} filterRecurring={tab === 'recurring'} />
        </CardContent>
      </Card>

      <TransactionForm open={open} onClose={() => setOpen(false)} />
    </div>
  )
}