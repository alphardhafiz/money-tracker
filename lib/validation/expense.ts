// lib/expenseSchema.ts
import { z } from "zod";

export const expenseSchema = z.object({
  amount: z
    .number({
      message: "Amount must be a number",
    })
    .min(1, "Amount must be at least 1"),

  category: z.string().min(1, "Please select a category"),

  note: z.string().optional(),

  date: z.string().optional(),
});
