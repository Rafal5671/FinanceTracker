import { useState } from 'react'
import { Trash2, Ban, CheckSquare, Square, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTransactionStore } from '@/store/transactionStore'
import { useCategoryStore } from '@/store/categoryStore'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types'

interface Props {
  search?: string
  filterRecurring?: boolean
}

type DialogState =
  | { type: 'none' }
  | { type: 'delete'; id: string; description: string }
  | { type: 'cancel'; id: string; description: string }
  | { type: 'bulkDelete'; ids: Set<string> }

function formatGroupDate(dateStr: string): string {
  const date      = new Date(dateStr)
  const today     = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString())     return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  })
}

export default function TransactionList({ search = '', filterRecurring = false }: Props) {
  const { transactions, remove, cancel } = useTransactionStore()
  const { categories }                   = useCategoryStore()
  const [selected, setSelected]          = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode]      = useState(false)
  const [dialog, setDialog]              = useState<DialogState>({ type: 'none' })

  function getCategory(categoryId: string) {
    return categories.find((c) => c.id === categoryId)
  }

  const filtered = transactions
    .filter((t) => {
      const q             = search.toLowerCase()
      const matchesSearch =
        t.description.toLowerCase().includes(q) ||
        getCategory(t.categoryId)?.name.toLowerCase().includes(q)
      const matchesFilter = filterRecurring ? t.isRecurring === 1 : true
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const groups = filtered.reduce<Record<string, Transaction[]>>((acc, t) => {
    const key = t.date.split('T')[0]
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  const groupEntries = Object.entries(groups)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())

  const defaultOpen = groupEntries.map(([date]) => date)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((t) => t.id)))
    }
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelected(new Set())
  }

  async function confirmAction() {
    if (dialog.type === 'delete') {
      await remove(dialog.id)
    } else if (dialog.type === 'cancel') {
      await cancel(dialog.id)
    } else if (dialog.type === 'bulkDelete') {
      for (const id of dialog.ids) {
        await remove(id)
      }
      exitSelectMode()
    }
    setDialog({ type: 'none' })
  }

  if (filtered.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        {search
          ? 'No transactions match your search'
          : 'No transactions yet — add your first one'}
      </div>
    )
  }

  const allSelected = selected.size === filtered.length

  return (
    <div>
      <div className="flex items-center justify-between px-1 py-2 min-h-10">
        {selectMode ? (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                className="h-8 gap-1.5 text-xs"
              >
                {allSelected
                  ? <CheckSquare size={14} className="text-primary" />
                  : <Square size={14} />}
                {allSelected ? 'Deselect all' : 'Select all'}
              </Button>
              <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            </div>

            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => setDialog({ type: 'bulkDelete', ids: new Set(selected) })}
                >
                  <Trash2 size={13} />
                  Delete ({selected.size})
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={exitSelectMode}
                className="h-8 w-8 p-0"
              >
                <X size={14} />
              </Button>
            </div>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectMode(true)}
            className="h-8 gap-1.5 text-xs text-muted-foreground ml-auto"
          >
            <CheckSquare size={14} />
            Select
          </Button>
        )}
      </div>

      <Accordion multiple defaultValue={defaultOpen} className="space-y-2">
        {groupEntries.map(([date, txs]) => {
          const groupTotal = txs.reduce(
            (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
            0
          )

          return (
            <AccordionItem key={date} value={date} className="border rounded-lg px-1">
              <AccordionTrigger className="px-3 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full mr-2">
                  <span className="text-sm font-medium">{formatGroupDate(date)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {txs.length} transaction{txs.length !== 1 ? 's' : ''}
                    </span>
                    <span className={cn(
                      'text-xs font-semibold',
                      groupTotal >= 0 ? 'text-emerald-500' : 'text-red-500'
                    )}>
                      {groupTotal >= 0 ? '+' : ''}{groupTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pb-1">
                <div className="divide-y">
                  {txs.map((t) => {
                    const category   = getCategory(t.categoryId)
                    const isSelected = selected.has(t.id)

                    return (
                      <div
                        key={t.id}
                        onClick={() => selectMode && toggleSelect(t.id)}
                        className={cn(
                          'flex items-center justify-between py-3 px-2 transition-colors rounded-md',
                          selectMode && 'cursor-pointer hover:bg-muted/50',
                          isSelected && 'bg-muted/70'
                        )}
                      >
                        {selectMode && (
                          <div className="mr-3 shrink-0">
                            {isSelected
                              ? <CheckSquare size={18} className="text-primary" />
                              : <Square size={18} className="text-muted-foreground" />}
                          </div>
                        )}

                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                            style={{ backgroundColor: category?.color + '22' }}
                          >
                            {category?.icon ?? '💸'}
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <p className="text-sm font-medium leading-none truncate">
                              {t.description}
                            </p>
                            <p className="text-xs text-muted-foreground">{category?.name}</p>
                            {t.isRecurring === 1 && (
                              <Badge
                                variant={t.isCancelled ? 'secondary' : 'outline'}
                                className="w-fit text-xs"
                              >
                                {t.isCancelled
                                  ? `Cancelled from ${t.cancelledFrom}`
                                  : `🔁 ${t.recurringInterval}`}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn(
                            'text-sm font-semibold',
                            t.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                          )}>
                            {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                          </span>

                          {!selectMode && (
                            <>
                              {t.isRecurring === 1 && t.isCancelled === 0 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-orange-500"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDialog({ type: 'cancel', id: t.id, description: t.description })
                                  }}
                                >
                                  <Ban size={14} />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDialog({ type: 'delete', id: t.id, description: t.description })
                                }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      <AlertDialog open={dialog.type !== 'none'} onOpenChange={(open) => !open && setDialog({ type: 'none' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialog.type === 'delete' && 'Delete transaction?'}
              {dialog.type === 'cancel' && 'Cancel recurring transaction?'}
              {dialog.type === 'bulkDelete' && 'Delete selected transactions?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialog.type === 'delete' && (
                <>
                  This action cannot be undone. Transaction{' '}
                  <span className="font-medium text-foreground">
                    {dialog.description}
                  </span>{' '}
                  will be permanently deleted.
                </>
              )}
              {dialog.type === 'cancel' && (
                <>
                  Transaction{' '}
                  <span className="font-medium text-foreground">
                    {dialog.description}
                  </span>{' '}
                  will no longer be generated from today. Previous entries remain unchanged.
                </>
              )}
              {dialog.type === 'bulkDelete' && (
                <>
                  <span className="font-medium text-foreground">
                    {dialog.type === 'bulkDelete' && dialog.ids.size}
                  </span>{' '}
                  transactions will be permanently deleted. This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmAction}
            >
              {dialog.type === 'cancel' ? 'Cancel recurring' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}