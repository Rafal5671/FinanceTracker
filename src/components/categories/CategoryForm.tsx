import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCategoryStore } from '@/store/categoryStore'
import type { Category } from '@/types'

const ICONS = ['🍔','🚗','🎮','💊','🏠','💰','✈️','👕','📚','🎵','🐶','💡','🏋️','🍺','☕','🎁','💻','📱','🏦','🛒','📦','🎯','🎨','🏖️','🎓']

const schema = z.object({
  name:  z.string().min(1, 'Name is required'),
  icon:  z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
  type:  z.enum(['income', 'expense']),
})

type FormData = z.infer<typeof schema>

interface Props {
  open:      boolean
  onClose:   () => void
  category?: Category
}

export default function CategoryForm({ open, onClose, category }: Props) {
  const { add, update } = useCategoryStore()
  const isEditing       = !!category

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
      type:  'expense',
      icon:  '💸',
      color: '#6366f1',
    },
  })

  useEffect(() => {
    if (category) {
      setValue('name',  category.name)
      setValue('icon',  category.icon)
      setValue('color', category.color)
      setValue('type',  category.type)
    } else {
      reset({ type: 'expense', icon: '💸', color: '#6366f1' })
    }
  }, [category, setValue, reset])

  const selectedIcon = watch('icon')
  const selectedType = watch('type')

  async function onSubmit(data: FormData) {
    if (isEditing) {
      await update(category.id, data)
    } else {
      await add(data)
    }
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'New Category'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="pt-2 space-y-4">

          {/* Type */}
          <div className="grid grid-cols-2 gap-2">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue('type', t)}
                className={`py-2 rounded-md text-sm font-medium border transition-colors capitalize ${
                  selectedType === t
                    ? t === 'expense'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Subscriptions" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Icon picker */}
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <div className="grid grid-cols-10 gap-1">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue('icon', icon)}
                  className={`h-9 w-9 rounded-md text-lg flex items-center justify-center transition-colors ${
                    selectedIcon === icon
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-3">
              <input
                id="color"
                type="color"
                className="w-10 h-10 rounded-md border cursor-pointer bg-transparent"
                {...register('color')}
              />
              <Input
                value={watch('color')}
                onChange={(e) => setValue('color', e.target.value)}
                placeholder="#6366f1"
                className="font-mono"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}