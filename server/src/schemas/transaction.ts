import { z } from 'zod';

export const transactionTypeSchema = z.enum(['INCOME', 'EXPENSE']);

export const createTransactionSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  type: transactionTypeSchema,
  category: z.string().trim().min(1, 'Category is required'),
  date: z.coerce.date('Invalid date'),
});

export const listTransactionsQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
  category: z.string().trim().min(1).optional(),
  startDate: z.coerce.date('Invalid startDate').optional(),
  endDate: z.coerce.date('Invalid endDate').optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
