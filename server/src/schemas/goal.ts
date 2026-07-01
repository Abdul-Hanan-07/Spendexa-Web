import { z } from 'zod';

const nameSchema = z.string().trim().min(1, 'Name is required');
const targetAmountSchema = z.coerce.number().positive('targetAmount must be greater than 0');
const currentAmountSchema = z.coerce.number().min(0, 'currentAmount must be 0 or greater');
const deadlineSchema = z.coerce.date('Invalid deadline');

export const createGoalSchema = z.object({
  name: nameSchema,
  targetAmount: targetAmountSchema,
  currentAmount: currentAmountSchema.default(0),
  deadline: deadlineSchema,
});

export const updateGoalSchema = z
  .object({
    name: nameSchema.optional(),
    targetAmount: targetAmountSchema.optional(),
    currentAmount: currentAmountSchema.optional(),
    deadline: deadlineSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
