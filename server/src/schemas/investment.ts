import { z } from 'zod';

export const investmentTypeSchema = z.enum(['PSX', 'CRYPTO', 'REAL_ESTATE', 'METAL']);

export const createInvestmentSchema = z.object({
  type: investmentTypeSchema,
  assetName: z.string().trim().min(1, 'Asset name is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  units: z.coerce.number().min(0).default(0),
  currentValue: z.coerce.number().min(0).default(0),
  purchaseDate: z.coerce.date('Invalid purchaseDate'),
});

export const listInvestmentsQuerySchema = z.object({
  type: investmentTypeSchema.optional(),
});

export const updateInvestmentSchema = z.object({
  currentValue: z.coerce.number().min(0, 'currentValue must be 0 or greater'),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
export type ListInvestmentsQuery = z.infer<typeof listInvestmentsQuerySchema>;
export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>;
