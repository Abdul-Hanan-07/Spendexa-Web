import { z } from 'zod';

export const upsertBudgetSchema = z
  .object({
    name: z.string().trim().min(1).default('General'),
    startAmount: z.coerce.number().positive('startAmount must be greater than 0'),
    startDate: z.coerce.date('Invalid startDate'),
    endDate: z.coerce.date('Invalid endDate'),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'startDate must be before endDate',
    path: ['endDate'],
  });

export type UpsertBudgetInput = z.infer<typeof upsertBudgetSchema>;
