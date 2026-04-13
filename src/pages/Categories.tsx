import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { useCategoryStore } from '@/store/categoryStore'
import CategoryForm from '@/components/categories/CategoryForm'
import CategoryList from '@/components/categories/CategoryList'

export default function Categories() {
  const [open, setOpen]          = useState(false)
  const { fetch: fetchCategories } = useCategoryStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your income and expense categories
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
          <Plus size={16} />
          New Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryList />
        </CardContent>
      </Card>

      <CategoryForm open={open} onClose={() => setOpen(false)} />
    </div>
  )
}