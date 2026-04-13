import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useBudgetStore } from '@/store/budgetStore'
import { useCategoryStore } from '@/store/categoryStore'

const schema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount:     z.coerce.number().positive('Amount must be positive'),
  month:      z.coerce.number().min(1).max(12),
  year:       z.coerce.number().min(2000).max(2100),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
}

export default function BudgetForm({ open, onClose }: Props) {
  const add                                    = useBudgetStore((s) => s.add)
  const { categories, fetch: fetchCategories } = useCategoryStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const now = new Date()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData, unknown, FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      month: now.getMonth() + 1,
      year:  now.getFullYear(),
    },
  })

  const expenseCategories = categories.filter((c) => c.type === 'expense')

  async function onSubmit(data: FormData) {
    await add(data)
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Budget</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="pt-2 space-y-4">

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select onValueChange={(v) => setValue('categoryId', v as string)}>
              <SelectTrigger>
                {watch('categoryId')
                  ? (() => {
                      const cat = expenseCategories.find((c) => c.id === watch('categoryId'))
                      return cat
                        ? <span>{cat.icon} {cat.name}</span>
                        : <span className="text-muted-foreground">Select category</span>
                    })()
                  : <span className="text-muted-foreground">Select category</span>
                }
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-red-500">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">Monthly limit</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount')}
            />
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Month + Year */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="month">Month</Label>
              <Select
                defaultValue={String(now.getMonth() + 1)}
                onValueChange={(v) => setValue('month', Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => ({
                    value: i + 1,
                    label: new Date(0, i).toLocaleString('en-US', { month: 'long' }),
                  })).map(({ value, label }) => (
                    <SelectItem key={value} value={String(value)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                {...register('year')}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Add Budget'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}