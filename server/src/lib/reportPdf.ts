import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import type { Prisma } from '@prisma/client';
import type { ReportData } from './report';
import { formatPeriodLabel } from './report';

let cachedLogoDataUri: string | null | undefined;

function getLogoDataUri(): string | null {
  if (cachedLogoDataUri !== undefined) return cachedLogoDataUri;
  try {
    const logoPath = path.join(__dirname, '../../../client/public/logo-full-light-bg.svg');
    const svg = fs.readFileSync(logoPath, 'utf-8');
    cachedLogoDataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  } catch {
    cachedLogoDataUri = null;
  }
  return cachedLogoDataUri;
}

function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function toNum(value: Prisma.Decimal | number): number {
  return typeof value === 'number' ? value : value.toNumber();
}

function money(value: Prisma.Decimal | number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(
      toNum(value),
    );
  } catch {
    return `${currency} ${toNum(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }
}

function dateStr(value: Date): string {
  return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STYLES = `
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1c1917;
    margin: 0;
    font-size: 12px;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 3px solid #f59e0b;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .header img { width: 44px; height: 44px; }
  .header h1 { font-size: 20px; margin: 0; color: #1c1917; }
  .header .meta { font-size: 11px; color: #57534e; margin-top: 4px; }
  .cover-page { page-break-after: always; break-after: page; }
  .report-section {
    margin-top: 10px;
    padding-top: 18px;
    border-top: 1px solid #e7e5e4;
  }
  h2.section-title {
    font-size: 15px;
    color: #b45309;
    border-left: 4px solid #f59e0b;
    padding-left: 10px;
    margin: 0 0 14px 0;
    break-after: avoid-page;
    page-break-after: avoid;
  }
  h3.subsection-title {
    font-size: 12px;
    color: #7c2d12;
    margin: 16px 0 8px;
    break-after: avoid-page;
    page-break-after: avoid;
  }
  thead { display: table-header-group; }
  tr { break-inside: avoid; page-break-inside: avoid; }
  .card-grid { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .stat-card {
    flex: 1 1 21%;
    background: #fffbeb;
    border: 1px solid #fde9c8;
    border-radius: 10px;
    padding: 12px 14px;
  }
  .stat-card .label { font-size: 10px; color: #78716c; text-transform: uppercase; letter-spacing: 0.04em; }
  .stat-card .value { font-size: 17px; font-weight: 700; color: #1c1917; margin-top: 4px; }
  .income-expense { display: flex; gap: 24px; margin-bottom: 20px; break-inside: avoid; page-break-inside: avoid; }
  .ie-bar-wrap { flex: 1; }
  .ie-bar-label { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; }
  .ie-bar-track { background: #f3f4f6; border-radius: 6px; height: 10px; overflow: hidden; }
  .ie-bar-fill { height: 100%; }
  .ie-bar-fill.income { background: #16a34a; }
  .ie-bar-fill.expense { background: #dc2626; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 18px; break-inside: auto; }
  th, td { text-align: left; padding: 6px 8px; font-size: 11px; border-bottom: 1px solid #e7e5e4; }
  th { background: #fdf3e0; color: #7c2d12; font-weight: 700; }
  tbody tr:nth-child(even) { background: #fafaf9; }
  .badge { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; }
  .badge.active { background: #dcfce7; color: #166534; }
  .badge.paid { background: #e0e7ff; color: #3730a3; }
  .badge.warn { background: #fef3c7; color: #92400e; }
  .badge.gain { color: #166534; }
  .badge.loss { color: #b91c1c; }
  .progress-track { background: #f3f4f6; border-radius: 6px; height: 8px; width: 100px; overflow: hidden; display: inline-block; vertical-align: middle; margin-right: 6px; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #14b8a6, #10b981); }
`;

function summarySectionHtml(data: ReportData, currency: string): string {
  return `
    <div class="cover-page">
      <h2 class="section-title">Summary</h2>
      <div class="card-grid">
        <div class="stat-card"><div class="label">Current Balance</div><div class="value">${money(data.summary.currentBalance, currency)}</div></div>
        <div class="stat-card"><div class="label">Net Worth</div><div class="value">${money(data.summary.netWorth, currency)}</div></div>
        <div class="stat-card"><div class="label">Total Loan Debt</div><div class="value">${money(data.summary.totalLoanDebt, currency)}</div></div>
        <div class="stat-card"><div class="label">Active Goals</div><div class="value">${data.summary.activeGoalCount}</div></div>
      </div>
      <div class="card-grid">
        <div class="stat-card"><div class="label">Budget Planned</div><div class="value">${money(data.summary.totalBudgetPlanned, currency)}</div></div>
        <div class="stat-card"><div class="label">Budget Remaining</div><div class="value">${money(data.summary.totalBudgetRemaining, currency)}</div></div>
        <div class="stat-card"><div class="label">Investment Portfolio Value</div><div class="value">${money(data.summary.investmentPortfolioValue, currency)}</div></div>
      </div>
    </div>
  `;
}

function incomeExpenseSectionHtml(data: ReportData, currency: string): string {
  const income = toNum(data.summary.totalIncome);
  const expense = toNum(data.summary.totalExpense);
  const max = Math.max(income, expense, 1);
  return `
    <div class="report-section">
      <h2 class="section-title">Income vs Expense (${escapeHtml(formatPeriodLabel(data.range))})</h2>
      <div class="income-expense">
        <div class="ie-bar-wrap">
          <div class="ie-bar-label"><span>Income</span><span>${money(data.summary.totalIncome, currency)}</span></div>
          <div class="ie-bar-track"><div class="ie-bar-fill income" style="width:${(income / max) * 100}%"></div></div>
        </div>
        <div class="ie-bar-wrap">
          <div class="ie-bar-label"><span>Expense</span><span>${money(data.summary.totalExpense, currency)}</span></div>
          <div class="ie-bar-track"><div class="ie-bar-fill expense" style="width:${(expense / max) * 100}%"></div></div>
        </div>
      </div>
    </div>
  `;
}

function transactionsSectionHtml(data: ReportData, currency: string): string {
  if (data.transactions.length === 0) return '';

  const rows = data.transactions
    .map(
      (tx) => `
        <tr>
          <td>${dateStr(tx.date)}</td>
          <td>${tx.type === 'INCOME' ? '<span class="badge active">Income</span>' : '<span class="badge warn">Expense</span>'}</td>
          <td>${escapeHtml(tx.category)}</td>
          <td>${money(tx.amount, currency)}</td>
        </tr>`,
    )
    .join('');

  return `
    <div class="report-section">
      <h2 class="section-title">Transactions (${data.transactions.length})</h2>
      <table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
    </div>
  `;
}

function investmentsSectionHtml(data: ReportData, currency: string): string {
  if (data.investments.length === 0) return '';

  const rows = data.investments
    .map((inv) => {
      const gainClass = toNum(inv.gainLoss) >= 0 ? 'gain' : 'loss';
      return `
        <tr>
          <td>${escapeHtml(inv.type)}</td>
          <td>${escapeHtml(inv.assetName)}</td>
          <td>${dateStr(inv.purchaseDate)}</td>
          <td>${money(inv.amount, currency)}</td>
          <td>${money(inv.currentValue, currency)}</td>
          <td class="badge ${gainClass}">${money(inv.gainLoss, currency)} (${toNum(inv.gainLossPercent).toFixed(2)}%)</td>
        </tr>`;
    })
    .join('');

  return `
    <div class="report-section">
      <h2 class="section-title">Investments (${data.investments.length})</h2>
      <table><thead><tr><th>Type</th><th>Asset</th><th>Purchase Date</th><th>Invested</th><th>Current Value</th><th>Gain/Loss</th></tr></thead><tbody>${rows}</tbody></table>
    </div>
  `;
}

function loansSectionHtml(data: ReportData, currency: string): string {
  if (data.loans.length === 0) return '';

  const loanRows = data.loans
    .map(
      (loan) => `
        <tr>
          <td>${escapeHtml(loan.label)}</td>
          <td>${money(loan.principal, currency)}</td>
          <td>${toNum(loan.interestRate).toFixed(2)}%</td>
          <td>${money(loan.remainingAmount, currency)}</td>
          <td><span class="badge ${loan.status === 'PAID_OFF' ? 'paid' : 'active'}">${loan.status === 'PAID_OFF' ? 'Paid off' : 'Active'}</span></td>
          <td>${dateStr(loan.startDate)}</td>
          <td>${dateStr(loan.endDate)}</td>
        </tr>`,
    )
    .join('');

  const repaymentRows = data.loans
    .flatMap((loan) => loan.repayments.map((r) => ({ loan, r })))
    .map(
      ({ loan, r }) => `
        <tr>
          <td>${escapeHtml(loan.label)}</td>
          <td>${money(r.amount, currency)}</td>
          <td>${dateStr(r.date)}</td>
        </tr>`,
    )
    .join('');

  return `
    <div class="report-section">
      <h2 class="section-title">Loans (${data.loans.length})</h2>
      <table><thead><tr><th>Loan</th><th>Principal</th><th>Interest Rate</th><th>Remaining</th><th>Status</th><th>Start Date</th><th>End Date</th></tr></thead><tbody>${loanRows}</tbody></table>
      ${
        repaymentRows
          ? `<h3 class="subsection-title">Repayment History</h3>
             <table><thead><tr><th>Loan</th><th>Amount</th><th>Date</th></tr></thead><tbody>${repaymentRows}</tbody></table>`
          : ''
      }
    </div>
  `;
}

function budgetsSectionHtml(data: ReportData, currency: string): string {
  if (data.budgets.length === 0) return '';

  const rows = data.budgets
    .map(
      (budget) => `
        <tr>
          <td>${escapeHtml(budget.name)}</td>
          <td>${money(budget.startAmount, currency)}</td>
          <td>${money(budget.remainingAmount, currency)}</td>
          <td>${money(budget.spentAmount, currency)}</td>
          <td>${dateStr(budget.startDate)} – ${dateStr(budget.endDate)}</td>
          <td>${budget.active ? '<span class="badge active">Active</span>' : '<span class="badge">Inactive</span>'}${budget.isNearLimit ? ' <span class="badge warn">Near limit</span>' : ''}</td>
        </tr>`,
    )
    .join('');

  return `
    <div class="report-section">
      <h2 class="section-title">Budget Status (${data.budgets.length})</h2>
      <table><thead><tr><th>Name</th><th>Planned</th><th>Remaining</th><th>Spent</th><th>Period</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
    </div>
  `;
}

function goalsSectionHtml(data: ReportData, currency: string): string {
  if (data.goals.length === 0) return '';

  const rows = data.goals
    .map(
      (goal) => `
        <tr>
          <td>${escapeHtml(goal.name)}</td>
          <td>${money(goal.targetAmount, currency)}</td>
          <td>${money(goal.currentAmount, currency)}</td>
          <td><div class="progress-track"><div class="progress-fill" style="width:${goal.progress}%"></div></div>${goal.progress.toFixed(1)}%</td>
          <td>${dateStr(goal.deadline)}</td>
        </tr>`,
    )
    .join('');

  return `
    <div class="report-section">
      <h2 class="section-title">Goals Progress (${data.goals.length})</h2>
      <table><thead><tr><th>Name</th><th>Target</th><th>Current</th><th>Progress</th><th>Deadline</th></tr></thead><tbody>${rows}</tbody></table>
    </div>
  `;
}

export function renderReportHtml(data: ReportData): string {
  const currency = data.user.currency;
  const logo = getLogoDataUri();
  const generatedAt = new Date().toLocaleString('en-US');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${STYLES}</style>
  </head>
  <body>
    <div class="header">
      ${logo ? `<img src="${logo}" alt="Spendexa" />` : ''}
      <div>
        <h1>Spendexa Financial Report</h1>
        <div class="meta">
          Prepared for ${escapeHtml(data.user.name)} &middot; Period: ${escapeHtml(formatPeriodLabel(data.range))}
          <br />Generated ${escapeHtml(generatedAt)}
        </div>
      </div>
    </div>
    ${summarySectionHtml(data, currency)}
    ${incomeExpenseSectionHtml(data, currency)}
    ${transactionsSectionHtml(data, currency)}
    ${investmentsSectionHtml(data, currency)}
    ${loansSectionHtml(data, currency)}
    ${budgetsSectionHtml(data, currency)}
    ${goalsSectionHtml(data, currency)}
  </body>
</html>`;
}

export async function renderPdf(data: ReportData): Promise<Buffer> {
  const html = renderReportHtml(data);
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `
        <div style="font-size:8px;width:100%;text-align:center;color:#78716c;font-family:Arial,sans-serif;">
          Generated by Spendexa &middot; ${escapeHtml(new Date().toLocaleString('en-US'))} &middot;
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>`,
      margin: { top: '16mm', bottom: '18mm', left: '12mm', right: '12mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
