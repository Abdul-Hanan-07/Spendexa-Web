import { Router } from 'express';
import { Prisma, InvestmentType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getDefaultAccount } from '../lib/account';
import { requireAuth } from '../middleware/auth';
import { getCurrentPrice, getHistoricalPrice } from '../lib/priceService';
import {
  createInvestmentSchema,
  listInvestmentsQuerySchema,
  priceLookupQuerySchema,
  updateInvestmentSchema,
} from '../schemas/investment';

const router = Router();

const AUTO_PRICEABLE_TYPES: InvestmentType[] = [InvestmentType.PSX, InvestmentType.CRYPTO];

function contributionOf(investment: { amount: Prisma.Decimal; currentValue: Prisma.Decimal }) {
  return investment.currentValue.greaterThan(0) ? investment.currentValue : investment.amount;
}

async function getUserCurrency(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
  return user?.currency ?? 'PKR';
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

router.get('/price-lookup', requireAuth, async (req, res) => {
  const parsed = priceLookupQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid query' });
  }

  const { type, symbol, date } = parsed.data;
  const currency = await getUserCurrency(req.userId!);
  const result = await getHistoricalPrice(type, symbol, date, currency);

  if (!result.ok) {
    return res.status(404).json({ error: result.error });
  }

  return res.json(result);
});

router.post('/refresh-all', requireAuth, async (req, res) => {
  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  const currency = await getUserCurrency(req.userId!);
  const investments = await prisma.investment.findMany({
    where: { accountId: account.id, type: { in: AUTO_PRICEABLE_TYPES } },
  });

  const results: Array<{
    id: string;
    assetName: string;
    success: boolean;
    price?: number;
    currentValue?: string;
    error?: string;
  }> = [];
  const updates: Array<{ id: string; currentValue: Prisma.Decimal }> = [];
  let totalDiff = new Prisma.Decimal(0);

  for (const inv of investments) {
    if (inv.units.lessThanOrEqualTo(0)) {
      results.push({ id: inv.id, assetName: inv.assetName, success: false, error: 'No units set for this holding.' });
      continue;
    }

    const priceResult = await getCurrentPrice(inv.type, inv.assetName, currency);
    if (!priceResult.ok) {
      results.push({ id: inv.id, assetName: inv.assetName, success: false, error: priceResult.error });
      continue;
    }

    const newCurrentValue = new Prisma.Decimal(priceResult.price).times(inv.units);
    totalDiff = totalDiff.plus(newCurrentValue.minus(contributionOf(inv)));
    updates.push({ id: inv.id, currentValue: newCurrentValue });
    results.push({
      id: inv.id,
      assetName: inv.assetName,
      success: true,
      price: priceResult.price,
      currentValue: newCurrentValue.toString(),
    });
  }

  try {
    const totalAssets = await prisma.$transaction(async (tx) => {
      for (const update of updates) {
        await tx.investment.update({
          where: { id: update.id },
          data: { currentValue: update.currentValue, priceUpdatedAt: new Date() },
        });
      }

      if (updates.length === 0) {
        return account.totalAssets;
      }

      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: { totalAssets: { increment: totalDiff } },
      });
      return updatedAccount.totalAssets;
    });

    return res.json({ totalAssets, results });
  } catch (err) {
    console.error('Refresh all prices error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/:id/refresh-price', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  const investment = await prisma.investment.findFirst({
    where: { id, account: { userId: req.userId } },
  });

  if (!investment) {
    return res.status(404).json({ error: 'Investment not found' });
  }

  if (!AUTO_PRICEABLE_TYPES.includes(investment.type)) {
    return res.status(400).json({ error: 'Auto pricing is not available for this asset type.' });
  }

  if (investment.units.lessThanOrEqualTo(0)) {
    return res.status(400).json({ error: 'Set the number of units before refreshing price.' });
  }

  const currency = await getUserCurrency(req.userId!);
  const priceResult = await getCurrentPrice(investment.type, investment.assetName, currency);

  if (!priceResult.ok) {
    return res.status(404).json({ error: priceResult.error });
  }

  try {
    const newCurrentValue = new Prisma.Decimal(priceResult.price).times(investment.units);

    const result = await prisma.$transaction(async (tx) => {
      const previousContribution = contributionOf(investment);
      const diff = newCurrentValue.minus(previousContribution);

      const updatedInvestment = await tx.investment.update({
        where: { id },
        data: { currentValue: newCurrentValue, priceUpdatedAt: new Date() },
      });

      const updatedAccount = await tx.account.update({
        where: { id: investment.accountId },
        data: { totalAssets: { increment: diff } },
      });

      return { investment: updatedInvestment, totalAssets: updatedAccount.totalAssets };
    });

    return res.json({ ...result, priceInfo: priceResult });
  } catch (err) {
    console.error('Refresh price error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
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

      const previousContribution = contributionOf(investment);
      const diff = new Prisma.Decimal(currentValue).minus(previousContribution);

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
