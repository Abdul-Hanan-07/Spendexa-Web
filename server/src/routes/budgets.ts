import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getDefaultAccount } from '../lib/account';
import { buildBudgetPayload } from '../lib/budget';
import { requireAuth } from '../middleware/auth';
import { upsertBudgetSchema } from '../schemas/budget';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  const parsed = upsertBudgetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { name, startAmount, startDate, endDate } = parsed.data;

  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.budget.findFirst({
        where: { accountId: account.id, active: true },
      });

      if (existing) {
        const budget = await tx.budget.update({
          where: { id: existing.id },
          data: {
            name,
            startAmount,
            remainingAmount: startAmount,
            spentAmount: 0,
            startDate,
            endDate,
          },
        });
        return { budget, action: 'updated' as const };
      }

      const budget = await tx.budget.create({
        data: {
          accountId: account.id,
          name,
          startAmount,
          remainingAmount: startAmount,
          spentAmount: 0,
          startDate,
          endDate,
        },
      });
      return { budget, action: 'created' as const };
    });

    return res.status(result.action === 'created' ? 201 : 200).json({
      budget: buildBudgetPayload(result.budget),
      action: result.action,
    });
  } catch (err) {
    console.error('Upsert budget error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  const budget = await prisma.budget.findFirst({
    where: { accountId: account.id, active: true },
  });

  return res.json({ budget: budget ? buildBudgetPayload(budget) : null });
});

router.get('/history', requireAuth, async (req, res) => {
  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  const budgets = await prisma.budget.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ budgets: budgets.map(buildBudgetPayload) });
});

router.patch('/:id/deactivate', requireAuth, async (req, res) => {
  const id = req.params.id as string;

  const budget = await prisma.budget.findFirst({
    where: { id, account: { userId: req.userId } },
  });

  if (!budget) {
    return res.status(404).json({ error: 'Budget not found' });
  }

  const updated = await prisma.budget.update({
    where: { id },
    data: { active: false },
  });

  return res.json({ budget: buildBudgetPayload(updated) });
});

export default router;
