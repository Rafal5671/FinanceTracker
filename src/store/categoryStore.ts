import { create } from "zustand";
import { getDB } from "@/db/client";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Category } from "@/types";

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (c: Omit<Category, "id">) => Promise<void>;
  update: (id: string, c: Partial<Omit<Category, 'id'>>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const db = await getDB();
    const rows = await db.select().from(categories);
    set({ categories: rows as Category[], loading: false });
  },

  add: async (c) => {
    const db = await getDB();
    await db.insert(categories).values({
      id: crypto.randomUUID(),
      ...c,
    });
    await get().fetch();
  },

  update: async (id, c) => {
    const db = await getDB();
    await db.update(categories).set(c).where(eq(categories.id, id));
    await get().fetch();
  },

  remove: async (id) => {
    const db = await getDB();
    await db.delete(categories).where(eq(categories.id, id));
    await get().fetch();
  },
}));
