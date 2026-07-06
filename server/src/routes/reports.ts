import { Router } from 'express';
import { getDefaultAccount } from '../lib/account';
import { getReportData, formatPeriodLabel } from '../lib/report';
import { buildWorkbook } from '../lib/reportExcel';
import { renderPdf } from '../lib/reportPdf';
import { requireAuth } from '../middleware/auth';
import { reportQuerySchema, pdfReportQuerySchema } from '../schemas/report';

const router = Router();

const PREVIEW_SAMPLE_SIZE = 12;

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

router.get('/preview', requireAuth, async (req, res) => {
  const parsed = reportQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid query' });
  }

  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  try {
    const data = await getReportData(req.userId!, account, parsed.data);

    return res.json({
      period: formatPeriodLabel(data.range),
      user: data.user,
      summary: data.summary,
      counts: {
        transactions: data.transactions.length,
        investments: data.investments.length,
        loans: data.loans.length,
        budgets: data.budgets.length,
        goals: data.goals.length,
      },
      samples: {
        transactions: data.transactions.slice(0, PREVIEW_SAMPLE_SIZE),
        investments: data.investments.slice(0, PREVIEW_SAMPLE_SIZE),
        loans: data.loans.slice(0, PREVIEW_SAMPLE_SIZE),
        budgets: data.budgets.slice(0, PREVIEW_SAMPLE_SIZE),
        goals: data.goals.slice(0, PREVIEW_SAMPLE_SIZE),
      },
    });
  } catch (err) {
    console.error('Report preview error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/export/excel', requireAuth, async (req, res) => {
  const parsed = reportQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid query' });
  }

  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  try {
    const data = await getReportData(req.userId!, account, parsed.data);
    const workbook = await buildWorkbook(data);
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="spendexa-report-${todayStamp()}.xlsx"`);
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Excel export error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/export/pdf', requireAuth, async (req, res) => {
  const parsed = pdfReportQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid query' });
  }

  const account = await getDefaultAccount(req.userId!);
  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  try {
    const data = await getReportData(req.userId!, account, parsed.data);
    const buffer = await renderPdf(data);

    const disposition = parsed.data.mode === 'inline' ? 'inline' : 'attachment';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="spendexa-report-${todayStamp()}.pdf"`);
    return res.send(buffer);
  } catch (err) {
    console.error('PDF export error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
