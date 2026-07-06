import { z } from 'zod';

export const reportQuerySchema = z
  .object({
    startDate: z.coerce.date('Invalid startDate').optional(),
    endDate: z.coerce.date('Invalid endDate').optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.startDate <= data.endDate, {
    message: 'startDate must be before endDate',
    path: ['endDate'],
  });

export const pdfReportQuerySchema = z
  .object({
    startDate: z.coerce.date('Invalid startDate').optional(),
    endDate: z.coerce.date('Invalid endDate').optional(),
    mode: z.enum(['inline', 'download']).optional().default('download'),
  })
  .refine((data) => !data.startDate || !data.endDate || data.startDate <= data.endDate, {
    message: 'startDate must be before endDate',
    path: ['endDate'],
  });

export type ReportQuery = z.infer<typeof reportQuerySchema>;
export type PdfReportQuery = z.infer<typeof pdfReportQuerySchema>;
