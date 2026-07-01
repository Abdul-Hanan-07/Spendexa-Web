import { z } from 'zod';

export const loanStatusSchema = z.enum(['ACTIVE', 'PAID_OFF']);

export const createLoanSchema = z
  .object({
    principal: z.coerce.number().positive('Principal must be greater than 0'),
    interestRate: z.coerce.number().min(0, 'Interest rate must be 0 or greater'),
    startDate: z.coerce.date('Invalid startDate'),
    endDate: z.coerce.date('Invalid endDate'),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'startDate must be before endDate',
    path: ['endDate'],
  });

export const listLoansQuerySchema = z.object({
  status: loanStatusSchema.optional(),
});

export const repayLoanSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type ListLoansQuery = z.infer<typeof listLoansQuerySchema>;
export type RepayLoanInput = z.infer<typeof repayLoanSchema>;
