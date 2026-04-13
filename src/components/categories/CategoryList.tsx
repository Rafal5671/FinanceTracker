import { useState } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCategoryStore } from '@/store/categoryStore'
import CategoryForm from './CategoryForm'
import type { Category } from '@/types'

export default function CategoryList() {
  const { categories, remove }          = useCategoryStore()
  const [editing, setEditing]           = useState<Category | null>(null)

  const income  = categories.filter((c) => c.type === 'income')
  const expense = categories.filter((c) => c.type === 'expense')

  function renderGroup(title: string, items: typeof categories) {
    if (items.length === 0) return null
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
        <div className="space-y-1">
          {items.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                  style={{ backgroundColor: c.color + '22' }}
                >
                  {c.icon}
                </div>
                <span className="text-sm font-medium">{c.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge
                  variant={c.type === 'income' ? 'default' : 'secondary'}
                  className="text-xs mr-1"
                >
                  {c.type}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditing(c)}
                >
                  <Pencil size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-red-500"
                  onClick={() => remove(c.id)}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
        No categories yet
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {renderGroup('Income', income)}
        {renderGroup('Expense', expense)}
      </div>

      <CategoryForm
        open={!!editing}
        onClose={() => setEditing(null)}
        category={editing ?? undefined}
      />
    </>
  )
}