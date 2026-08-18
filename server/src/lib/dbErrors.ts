import { Prisma } from '@prisma/client';

// Prisma doesn't surface a clean error code for a plain (non-raw) mutation
// that overflows a Decimal column server-side (e.g. currentBalance/totalAssets
// after an increment pushes the value past what Decimal(14,2) can hold) -- it
// comes back as a PrismaClientUnknownRequestError with the Postgres SQLSTATE
// (22003, numeric_field_overflow) embedded in the message text.
export function isNumericOverflowError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientUnknownRequestError && err.message.includes('22003');
}
