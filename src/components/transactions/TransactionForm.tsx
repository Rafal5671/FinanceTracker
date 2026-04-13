import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  categoryId: z.string().min(1, "Category is required"),
  isRecurring: z.boolean(),
  recurringInterval: z
    .enum(["daily", "weekly", "monthly", "yearly"])
    .nullable(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TransactionForm({ open, onClose }: Props) {
  const add = useTransactionStore((s) => s.add);
  const { categories, fetch: fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData, unknown, FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
      recurringInterval: null,
    },
  });

  const type = watch("type");
  const isRecurring = watch("isRecurring");

  const filteredCategories = categories.filter((c) => c.type === type);

  async function onSubmit(data: FormData) {
    await add({
      ...data,
      isRecurring: data.isRecurring ? 1 : 0,
      recurringInterval: data.isRecurring ? data.recurringInterval : null,
      isCancelled: 0,
      cancelledFrom: null,
    });
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="pt-2 space-y-4">
          {/* Type */}
          <div className="grid grid-cols-2 gap-2">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue("type", t)}
                className={`py-2 rounded-md text-sm font-medium border transition-colors capitalize ${
                  type === t
                    ? t === "expense"
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-emerald-500 text-white border-emerald-500"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Grocery shopping"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select onValueChange={(v) => setValue("categoryId", v as string)}>
              <SelectTrigger>
                {watch("categoryId") ? (
                  (() => {
                    const cat = filteredCategories.find(
                      (c) => c.id === watch("categoryId"),
                    );
                    return cat ? (
                      <span>
                        {cat.icon} {cat.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Select category
                      </span>
                    );
                  })()
                ) : (
                  <span className="text-muted-foreground">Select category</span>
                )}
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-red-500">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Recurring */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring"
                className="w-4 h-4 accent-primary"
                {...register("isRecurring")}
              />
              <Label htmlFor="isRecurring">Recurring transaction</Label>
            </div>

            {isRecurring && (
              <Select
                onValueChange={(v) =>
                  setValue(
                    "recurringInterval",
                    v as FormData["recurringInterval"],
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  {(["daily", "weekly", "monthly", "yearly"] as const).map(
                    (i) => (
                      <SelectItem key={i} value={i} className="capitalize">
                        {i}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
