import Papa from "papaparse";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";
import type { Transaction } from "@/types";

interface CSVRow {
  Date: string;
  Type: string;
  Amount: string;
  Description: string;
  Category: string;
  Recurring: string;
}

const CATEGORY_COLORS = [
  "#f97316",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#22c55e",
  "#eab308",
  "#ec4899",
  "#14b8a6",
  "#f43f5e",
];

export function useImportCSV() {
  const { add: addTransaction, fetch } = useTransactionStore();
  const { categories, add: addCategory } = useCategoryStore();

  async function importCSV(
    file: File,
  ): Promise<{ imported: number; skipped: number }> {
    return new Promise((resolve, reject) => {
      Papa.parse<CSVRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          let imported = 0;
          let skipped = 0;

          const categoryCache = new Map(
            categories.map((c) => [c.name.toLowerCase(), c]),
          );

          for (const row of results.data) {
            try {
              const type = row.Type?.toLowerCase();
              if (type !== "income" && type !== "expense") {
                skipped++;
                continue;
              }

              const amount = parseFloat(row.Amount);
              if (isNaN(amount) || amount <= 0) {
                skipped++;
                continue;
              }

              const date = row.Date?.trim();
              if (!date) {
                skipped++;
                continue;
              }

              const description = row.Description?.trim();
              if (!description) {
                skipped++;
                continue;
              }

              const categoryName = row.Category?.trim();
              let category = categoryCache.get(categoryName?.toLowerCase());
              if (!category && categoryName) {
                const colorIndex = categoryCache.size % CATEGORY_COLORS.length;
                await addCategory({
                  name: categoryName,
                  icon: "📦",
                  color: CATEGORY_COLORS[colorIndex],
                  type: type as "income" | "expense",
                });
                category = categories.find(
                  (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
                );
                if (category) {
                  categoryCache.set(categoryName.toLowerCase(), category);
                }
              }

              const recurringInterval = (
                ["daily", "weekly", "monthly", "yearly"].includes(
                  row.Recurring?.toLowerCase(),
                )
                  ? row.Recurring.toLowerCase()
                  : null
              ) as Transaction["recurringInterval"];

              await addTransaction({
                type: type as "income" | "expense",
                amount,
                date,
                description,
                categoryId: category?.id ?? "",
                isRecurring: recurringInterval ? 1 : 0,
                recurringInterval,
                isCancelled: 0,
                cancelledFrom: null,
              });

              imported++;
            } catch {
              skipped++;
            }
          }

          await fetch();
          resolve({ imported, skipped });
        },
        error: reject,
      });
    });
  }

  return { importCSV };
}
