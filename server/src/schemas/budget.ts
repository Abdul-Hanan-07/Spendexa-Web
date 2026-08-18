import { z } from 'zod';
import { MAX_MONEY_AMOUNT, MONEY_TOO_LARGE_MESSAGE } from './money';

export const upsertBudgetSchema = z
  .object({
    name: z.string().trim().min(1).default('General'),
    startAmount: z.coerce.number().positive('startAmount must be greater than 0').max(MAX_MONEY_AMOUNT, MONEY_TOO_LARGE_MESSAGE),
    startDate: z.coerce.date('Invalid startDate'),
    endDate: z.coerce.date('Invalid endDate'),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'startDate must be before endDate',
    path: ['endDate'],
  });

export type UpsertBudgetInput = z.infer<typeof upsertBudgetSchema>;
