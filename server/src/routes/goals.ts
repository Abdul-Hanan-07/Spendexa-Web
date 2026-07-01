import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getDefaultAccount } from '../lib/account';
import { buildGoalPayload } from '../lib/goal';
import { requireAuth } from '../middleware/auth';
import { createGoalSchema, updateGoalSchema } from '../schemas/goal';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  const parsed = createGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { name, targetAmount, currentAmount, deadline } = parsed.data;

  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  try {
    const goal = await prisma.goal.create({
      data: { accountId: account.id, name, targetAmount, currentAmount, deadline },
    });

    return res.status(201).json({ goal: buildGoalPayload(goal) });
  } catch (err) {
    console.error('Create goal error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  const goals = await prisma.goal.findMany({
    where: { accountId: account.id },
    orderBy: { deadline: 'asc' },
  });

  return res.json({ goals: goals.map(buildGoalPayload) });
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  const goal = await prisma.goal.findFirst({
    where: { id, account: { userId: req.userId } },
  });

  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' });
  }

  return res.json({ goal: buildGoalPayload(goal) });
});

router.patch('/:id', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  const parsed = updateGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const goal = await prisma.goal.findFirst({
    where: { id, account: { userId: req.userId } },
  });

  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' });
  }

  const updated = await prisma.goal.update({
    where: { id },
    data: parsed.data,
  });

  return res.json({ goal: buildGoalPayload(updated) });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id as string;

  const goal = await prisma.goal.findFirst({
    where: { id, account: { userId: req.userId } },
  });

  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' });
  }

  await prisma.goal.delete({ where: { id } });

  return res.json({ success: true });
});

export default router;
