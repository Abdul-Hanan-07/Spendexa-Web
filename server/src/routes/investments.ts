import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getDefaultAccount } from '../lib/account';
import { requireAuth } from '../middleware/auth';
import {
  createInvestmentSchema,
  listInvestmentsQuerySchema,
  updateInvestmentSchema,
} from '../schemas/investment';

const router = Router();

function contributionOf(investment: { amount: Prisma.Decimal; currentValue: Prisma.Decimal }) {
  return investment.currentValue.greaterThan(0) ? investment.currentValue : investment.amount;
}

router.post('/', requireAuth, async (req, res) => {
  const parsed = createInvestmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { type, assetName, amount, units, currentValue, purchaseDate } = parsed.data;

  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const investment = await tx.investment.create({
        data: { accountId: account.id, type, assetName, amount, units, currentValue, purchaseDate },
      });

      const contribution = currentValue > 0 ? currentValue : amount;

      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: { totalAssets: { increment: contribution } },
      });

      return { investment, totalAssets: updatedAccount.totalAssets };
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error('Create investment error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  const parsed = listInvestmentsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid query' });
  }

  const { type } = parsed.data;

  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  const investments = await prisma.investment.findMany({
    where: { accountId: account.id, ...(type ? { type } : {}) },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ investments });
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  const investment = await prisma.investment.findFirst({
    where: { id, account: { userId: req.userId } },
  });

  if (!investment) {
    return res.status(404).json({ error: 'Investment not found' });
  }

  return res.json({ investment });
});

router.patch('/:id', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  const parsed = updateInvestmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { currentValue } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const investment = await tx.investment.findFirst({
        where: { id, account: { userId: req.userId } },
      });

      if (!investment) {
        return null;
      }

      const diff = new Prisma.Decimal(currentValue).minus(investment.currentValue);

      const updatedInvestment = await tx.investment.update({
        where: { id },
        data: { currentValue },
      });

      const updatedAccount = await tx.account.update({
        where: { id: investment.accountId },
        data: { totalAssets: { increment: diff } },
      });

      return { investment: updatedInvestment, totalAssets: updatedAccount.totalAssets };
    });

    if (!result) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    return res.json(result);
  } catch (err) {
    console.error('Update investment error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const investment = await tx.investment.findFirst({
        where: { id, account: { userId: req.userId } },
      });

      if (!investment) {
        return null;
      }

      await tx.investment.delete({ where: { id } });

      const contribution = contributionOf(investment);

      const updatedAccount = await tx.account.update({
        where: { id: investment.accountId },
        data: { totalAssets: { decrement: contribution } },
      });

      return { totalAssets: updatedAccount.totalAssets };
    });

    if (!result) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    return res.json({ success: true, totalAssets: result.totalAssets });
  } catch (err) {
    console.error('Delete investment error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
