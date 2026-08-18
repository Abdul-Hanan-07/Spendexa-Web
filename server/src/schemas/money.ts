// Prisma Decimal(14,2) columns can hold at most 12 digits before the decimal
// point. Reject anything beyond that at the Zod layer instead of letting it
// fall through to a raw Postgres numeric overflow error.
export const MAX_MONEY_AMOUNT = 999_999_999_999.99;
export const MONEY_TOO_LARGE_MESSAGE = `Amount cannot exceed ${MAX_MONEY_AMOUNT.toLocaleString('en-US')}`;

// Loan.remainingAmount (also Decimal(14,2)) is derived as principal * (1 + interestRate / 100).
// Cap principal so that even at the max allowed interest rate, remainingAmount can't overflow.
export const MAX_LOAN_INTEREST_RATE = 100;
export const MAX_LOAN_PRINCIPAL = MAX_MONEY_AMOUNT / (1 + MAX_LOAN_INTEREST_RATE / 100);
export const LOAN_PRINCIPAL_TOO_LARGE_MESSAGE = `Principal cannot exceed ${MAX_LOAN_PRINCIPAL.toLocaleString('en-US')}`;
export const LOAN_INTEREST_RATE_TOO_LARGE_MESSAGE = `Interest rate cannot exceed ${MAX_LOAN_INTEREST_RATE}%`;
