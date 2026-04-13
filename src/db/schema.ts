import { pgTable, text, real, integer } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  type: text("type").$type<"income" | "expense">().notNull(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").references(() => categories.id),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  type: text("type").$type<"income" | "expense">().notNull(),
  isRecurring: integer("is_recurring").default(0),
  recurringInterval: text("recurring_interval").$type<
    "daily" | "weekly" | "monthly" | "yearly" | null
  >(),
  isCancelled:       integer('is_cancelled').default(0),
  cancelledFrom:     text('cancelled_from'),
});

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").references(() => categories.id),
  amount: real("amount").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
});
export const recurringLedger = pgTable("recurring_ledger", {
  id: text("id").primaryKey(),
  sourceTransactionId: text("source_transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
  periodKey: text("period_key").notNull(),
  generatedTransactionId: text("generated_transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
});
