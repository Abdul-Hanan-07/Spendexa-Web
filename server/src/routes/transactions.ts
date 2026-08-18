import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getDefaultAccount } from '../lib/account';
import { buildBudgetPayload, isBudgetWithinPeriod } from '../lib/budget';
import { isNumericOverflowError } from '../lib/dbErrors';
import { requireAuth } from '../middleware/auth';
import { createTransactionSchema, listTransactionsQuerySchema } from '../schemas/transaction';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  const parsed = createTransactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { amount, type, category, date } = parsed.data;

  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let chargedBudgetId: string | null = null;
      if (type === 'EXPENSE') {
        const activeBudget = await tx.budget.findFirst({
          where: { accountId: account.id, active: true },
        });

        if (activeBudget && isBudgetWithinPeriod(activeBudget, date)) {
          chargedBudgetId = activeBudget.id;
        }
      }

      const transaction = await tx.transaction.create({
        data: { accountId: account.id, amount, type, category, date, budgetId: chargedBudgetId },
      });

      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: {
          currentBalance: {
            [type === 'INCOME' ? 'increment' : 'decrement']: amount,
          },
        },
      });

      let budget = null;
      if (chargedBudgetId) {
        budget = await tx.budget.update({
          where: { id: chargedBudgetId },
          data: {
            remainingAmount: { decrement: amount },
            spentAmount: { increment: amount },
          },
        });
      }

      return {
        transaction,
        currentBalance: updatedAccount.currentBalance,
        budget: budget ? buildBudgetPayload(budget) : null,
      };
    });

    return res.status(201).json(result);
  } catch (err) {
    if (isNumericOverflowError(err)) {
      return res.status(400).json({ error: 'That amount would push the account balance beyond what can be stored.' });
    }
    console.error('Create transaction error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  const parsed = listTransactionsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid query' });
  }

  const { type, category, search, startDate, endDate, limit, offset } = parsed.data;

  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  const categoryFilter: Prisma.StringFilter | undefined = category
    ? { equals: category }
    : search
      ? { contains: search, mode: 'insensitive' }
      : undefined;

  const where: Prisma.TransactionWhereInput = {
    accountId: account.id,
    ...(type ? { type } : {}),
    ...(categoryFilter ? { category: categoryFilter } : {}),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    take: limit,
    skip: offset,
  });

  return res.json({ transactions });
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  const transaction = await prisma.transaction.findFirst({
    where: { id, account: { userId: req.userId } },
  });

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  return res.json({ transaction });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: { id, account: { userId: req.userId } },
      });

      if (!transaction) {
        return null;
      }

      await tx.transaction.delete({ where: { id: transaction.id } });

      const updatedAccount = await tx.account.update({
        where: { id: transaction.accountId },
        data: {
          currentBalance: {
            [transaction.type === 'INCOME' ? 'decrement' : 'increment']: transaction.amount,
          },
        },
      });

      let budget = null;
      if (transaction.type === 'EXPENSE' && transaction.budgetId) {
        budget = await tx.budget.update({
          where: { id: transaction.budgetId },
          data: {
            remainingAmount: { increment: transaction.amount },
            spentAmount: { decrement: transaction.amount },
          },
        });
      }

      return {
        transaction,
        currentBalance: updatedAccount.currentBalance,
        budget: budget ? buildBudgetPayload(budget) : null,
      };
    });

    if (!result) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    return res.json({ success: true, currentBalance: result.currentBalance, budget: result.budget });
  } catch (err) {
    if (isNumericOverflowError(err)) {
      return res.status(400).json({ error: 'That amount would push the account balance beyond what can be stored.' });
    }
    console.error('Delete transaction error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
