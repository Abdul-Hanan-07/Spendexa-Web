import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getDefaultAccount } from '../lib/account';
import { requireAuth } from '../middleware/auth';
import { createLoanSchema, listLoansQuerySchema, repayLoanSchema } from '../schemas/loan';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  const parsed = createLoanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { principal, interestRate, startDate, endDate } = parsed.data;

  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  const remainingAmount = new Prisma.Decimal(principal).plus(
    new Prisma.Decimal(principal).times(interestRate).div(100),
  );

  try {
    const loan = await prisma.loan.create({
      data: { accountId: account.id, principal, interestRate, remainingAmount, startDate, endDate },
    });

    return res.status(201).json({ loan });
  } catch (err) {
    console.error('Create loan error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  const parsed = listLoansQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid query' });
  }

  const { status } = parsed.data;

  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  const loans = await prisma.loan.findMany({
    where: { accountId: account.id, ...(status ? { status } : {}) },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ loans });
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  const loan = await prisma.loan.findFirst({
    where: { id, account: { userId: req.userId } },
    include: { repayments: { orderBy: { date: 'desc' } } },
  });

  if (!loan) {
    return res.status(404).json({ error: 'Loan not found' });
  }

  return res.json({ loan });
});

router.post('/:id/repay', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  const parsed = repayLoanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { amount } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findFirst({
        where: { id, account: { userId: req.userId } },
      });

      if (!loan) {
        return { outcome: 'not_found' as const };
      }

      if (loan.status === 'PAID_OFF') {
        return { outcome: 'already_paid' as const };
      }

      const newRemaining = Prisma.Decimal.max(loan.remainingAmount.minus(amount), 0);
      const newStatus = newRemaining.equals(0) ? 'PAID_OFF' : loan.status;

      const repayment = await tx.loanRepayment.create({
        data: { loanId: loan.id, amount },
      });

      const updatedLoan = await tx.loan.update({
        where: { id: loan.id },
        data: { remainingAmount: newRemaining, status: newStatus },
      });

      return { outcome: 'ok' as const, repayment, loan: updatedLoan };
    });

    if (result.outcome === 'not_found') {
      return res.status(404).json({ error: 'Loan not found' });
    }
    if (result.outcome === 'already_paid') {
      return res.status(400).json({ error: 'Loan is already paid off' });
    }

    return res.status(201).json({ loan: result.loan, repayment: result.repayment });
  } catch (err) {
    console.error('Repay loan error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id as string;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findFirst({
        where: { id, account: { userId: req.userId } },
        include: { _count: { select: { repayments: true } } },
      });

      if (!loan) {
        return { outcome: 'not_found' as const };
      }

      if (loan._count.repayments > 0) {
        return { outcome: 'has_repayments' as const };
      }

      await tx.loan.delete({ where: { id } });

      return { outcome: 'ok' as const };
    });

    if (result.outcome === 'not_found') {
      return res.status(404).json({ error: 'Loan not found' });
    }
    if (result.outcome === 'has_repayments') {
      return res
        .status(400)
        .json({ error: 'Cannot delete a loan that has repayments recorded' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Delete loan error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
