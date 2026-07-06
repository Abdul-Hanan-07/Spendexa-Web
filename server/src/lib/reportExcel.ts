import ExcelJS from 'exceljs';
import type { Prisma } from '@prisma/client';
import type { ReportData } from './report';
import { formatPeriodLabel } from './report';

const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE9C8' } };
const ALT_ROW_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAF9F7' } };
const DATE_FMT = 'mm/dd/yyyy';
const PERCENT_FMT = '0.00%';

function toNum(value: Prisma.Decimal | number): number {
  return typeof value === 'number' ? value : value.toNumber();
}

function currencyFmt(currency: string): string {
  return `"${currency}" #,##0.00`;
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = HEADER_FILL;
  });
}

function shadeAlternatingRows(sheet: ExcelJS.Worksheet) {
  let dataRowIndex = 0;
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    dataRowIndex += 1;
    if (dataRowIndex % 2 === 0) {
      row.eachCell((cell) => {
        if (!cell.fill) cell.fill = ALT_ROW_FILL;
      });
    }
  });
}

function estimatedDisplayWidth(cell: ExcelJS.Cell): number {
  const value = cell.value;
  const numFmt = cell.numFmt;

  // exceljs's cell.text does not apply numFmt to numbers/dates (it returns
  // the raw value), so columns sized from it undercount how wide the
  // formatted display actually is (e.g. "PKR" #,##0.00 renders far longer
  // than the raw number) and Excel shows "###" for the truncated cells.
  if (value instanceof Date) {
    return 10; // mm/dd/yyyy
  }
  if (typeof value === 'number') {
    if (numFmt === PERCENT_FMT) {
      return `${(value * 100).toFixed(2)}%`.length;
    }
    const currencyPrefix = /^"([^"]+)"/.exec(numFmt ?? '')?.[1];
    if (currencyPrefix) {
      const formatted = `${currencyPrefix} ${Math.abs(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
      return value < 0 ? formatted.length + 1 : formatted.length;
    }
    return String(value).length;
  }

  return (cell.text ?? String(value ?? '')).length;
}

function autoSizeColumns(sheet: ExcelJS.Worksheet) {
  sheet.columns.forEach((column) => {
    let maxLen = column.header ? String(column.header).length : 10;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = estimatedDisplayWidth(cell);
      if (len > maxLen) maxLen = len;
    });
    column.width = Math.min(Math.max(maxLen + 2, 10), 40);
  });
}

function finalizeSheet(sheet: ExcelJS.Worksheet) {
  styleHeaderRow(sheet.getRow(1));
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  autoSizeColumns(sheet);
  shadeAlternatingRows(sheet);
}

function addSummarySheet(workbook: ExcelJS.Workbook, data: ReportData, currency: string) {
  const sheet = workbook.addWorksheet('Summary');
  sheet.columns = [
    { header: 'Metric', key: 'metric', width: 32 },
    { header: 'Value', key: 'value', width: 24 },
  ];

  const lines: { metric: string; value: string | number; money?: boolean }[] = [
    { metric: 'Report period', value: formatPeriodLabel(data.range) },
    { metric: 'Generated at', value: new Date().toLocaleString('en-US') },
    { metric: 'Current balance', value: toNum(data.summary.currentBalance), money: true },
    { metric: 'Net worth', value: toNum(data.summary.netWorth), money: true },
    { metric: 'Total loan debt', value: toNum(data.summary.totalLoanDebt), money: true },
    { metric: 'Total budget planned', value: toNum(data.summary.totalBudgetPlanned), money: true },
    { metric: 'Total budget remaining', value: toNum(data.summary.totalBudgetRemaining), money: true },
    { metric: 'Investment portfolio value', value: toNum(data.summary.investmentPortfolioValue), money: true },
    { metric: 'Total income (period)', value: toNum(data.summary.totalIncome), money: true },
    { metric: 'Total expense (period)', value: toNum(data.summary.totalExpense), money: true },
    { metric: 'Active goals', value: data.summary.activeGoalCount },
  ];

  sheet.addRows(lines.map((line) => ({ metric: line.metric, value: line.value })));
  lines.forEach((line, i) => {
    if (line.money) {
      sheet.getCell(i + 2, 2).numFmt = currencyFmt(currency);
    }
  });

  finalizeSheet(sheet);
}

function addTransactionsSheet(workbook: ExcelJS.Workbook, data: ReportData, currency: string) {
  const sheet = workbook.addWorksheet('Transactions');
  sheet.columns = [
    { header: 'Date', key: 'date', width: 14, style: { numFmt: DATE_FMT } },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Category', key: 'category', width: 22 },
    { header: 'Amount', key: 'amount', width: 16, style: { numFmt: currencyFmt(currency) } },
  ];

  sheet.addRows(
    data.transactions.map((tx) => ({
      date: tx.date,
      type: tx.type,
      category: tx.category,
      amount: toNum(tx.amount),
    })),
  );

  finalizeSheet(sheet);
}

function addInvestmentsSheet(workbook: ExcelJS.Workbook, data: ReportData, currency: string) {
  const sheet = workbook.addWorksheet('Investments');
  sheet.columns = [
    { header: 'Type', key: 'type', width: 14 },
    { header: 'Asset Name', key: 'assetName', width: 24 },
    { header: 'Purchase Date', key: 'purchaseDate', width: 14, style: { numFmt: DATE_FMT } },
    { header: 'Amount Invested', key: 'amount', width: 16, style: { numFmt: currencyFmt(currency) } },
    { header: 'Units', key: 'units', width: 12 },
    { header: 'Current Value', key: 'currentValue', width: 16, style: { numFmt: currencyFmt(currency) } },
    { header: 'Gain/Loss', key: 'gainLoss', width: 16, style: { numFmt: currencyFmt(currency) } },
    { header: 'Gain/Loss %', key: 'gainLossPercent', width: 14, style: { numFmt: PERCENT_FMT } },
  ];

  sheet.addRows(
    data.investments.map((inv) => ({
      type: inv.type,
      assetName: inv.assetName,
      purchaseDate: inv.purchaseDate,
      amount: toNum(inv.amount),
      units: toNum(inv.units),
      currentValue: toNum(inv.currentValue),
      gainLoss: toNum(inv.gainLoss),
      gainLossPercent: toNum(inv.gainLossPercent) / 100,
    })),
  );

  finalizeSheet(sheet);
}

function addLoansSheet(workbook: ExcelJS.Workbook, data: ReportData, currency: string) {
  const sheet = workbook.addWorksheet('Loans');
  sheet.columns = [
    { header: 'Loan', key: 'label', width: 28 },
    { header: 'Principal', key: 'principal', width: 16, style: { numFmt: currencyFmt(currency) } },
    { header: 'Interest Rate', key: 'interestRate', width: 14, style: { numFmt: PERCENT_FMT } },
    { header: 'Remaining', key: 'remainingAmount', width: 16, style: { numFmt: currencyFmt(currency) } },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Start Date', key: 'startDate', width: 14, style: { numFmt: DATE_FMT } },
    { header: 'End Date', key: 'endDate', width: 14, style: { numFmt: DATE_FMT } },
  ];

  sheet.addRows(
    data.loans.map((loan) => ({
      label: loan.label,
      principal: toNum(loan.principal),
      interestRate: toNum(loan.interestRate) / 100,
      remainingAmount: toNum(loan.remainingAmount),
      status: loan.status === 'PAID_OFF' ? 'Paid off' : 'Active',
      startDate: loan.startDate,
      endDate: loan.endDate,
    })),
  );

  styleHeaderRow(sheet.getRow(1));
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  sheet.addRow({});
  const titleRowNumber = sheet.rowCount + 1;
  sheet.addRow({ label: 'Repayment History' });
  sheet.mergeCells(titleRowNumber, 1, titleRowNumber, 7);
  styleHeaderRow(sheet.getRow(titleRowNumber));

  const subHeaderRowNumber = titleRowNumber + 1;
  sheet.addRow({ label: 'Loan', principal: 'Amount', startDate: 'Date' });
  styleHeaderRow(sheet.getRow(subHeaderRowNumber));

  const allRepayments = data.loans.flatMap((loan) =>
    loan.repayments.map((repayment) => ({
      label: loan.label,
      principal: toNum(repayment.amount),
      startDate: repayment.date,
    })),
  );

  if (allRepayments.length === 0) {
    sheet.addRow({ label: 'No repayments recorded' });
  } else {
    sheet.addRows(allRepayments);
  }

  autoSizeColumns(sheet);
  shadeAlternatingRows(sheet);
}

function addBudgetsSheet(workbook: ExcelJS.Workbook, data: ReportData, currency: string) {
  const sheet = workbook.addWorksheet('Budgets');
  sheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Start Amount', key: 'startAmount', width: 16, style: { numFmt: currencyFmt(currency) } },
    { header: 'Remaining Amount', key: 'remainingAmount', width: 16, style: { numFmt: currencyFmt(currency) } },
    { header: 'Spent Amount', key: 'spentAmount', width: 16, style: { numFmt: currencyFmt(currency) } },
    { header: 'Start Date', key: 'startDate', width: 14, style: { numFmt: DATE_FMT } },
    { header: 'End Date', key: 'endDate', width: 14, style: { numFmt: DATE_FMT } },
    { header: 'Active', key: 'active', width: 10 },
    { header: 'Near Limit', key: 'isNearLimit', width: 12 },
  ];

  sheet.addRows(
    data.budgets.map((budget) => ({
      name: budget.name,
      startAmount: toNum(budget.startAmount),
      remainingAmount: toNum(budget.remainingAmount),
      spentAmount: toNum(budget.spentAmount),
      startDate: budget.startDate,
      endDate: budget.endDate,
      active: budget.active ? 'Yes' : 'No',
      isNearLimit: budget.isNearLimit ? 'Yes' : 'No',
    })),
  );

  finalizeSheet(sheet);
}

function addGoalsSheet(workbook: ExcelJS.Workbook, data: ReportData, currency: string) {
  const sheet = workbook.addWorksheet('Goals');
  sheet.columns = [
    { header: 'Name', key: 'name', width: 24 },
    { header: 'Target Amount', key: 'targetAmount', width: 16, style: { numFmt: currencyFmt(currency) } },
    { header: 'Current Amount', key: 'currentAmount', width: 16, style: { numFmt: currencyFmt(currency) } },
    { header: 'Progress %', key: 'progress', width: 12, style: { numFmt: PERCENT_FMT } },
    { header: 'Deadline', key: 'deadline', width: 14, style: { numFmt: DATE_FMT } },
  ];

  sheet.addRows(
    data.goals.map((goal) => ({
      name: goal.name,
      targetAmount: toNum(goal.targetAmount),
      currentAmount: toNum(goal.currentAmount),
      progress: goal.progress / 100,
      deadline: goal.deadline,
    })),
  );

  finalizeSheet(sheet);
}

export async function buildWorkbook(data: ReportData): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Spendexa';
  workbook.created = new Date();

  const currency = data.user.currency;

  addSummarySheet(workbook, data, currency);
  addTransactionsSheet(workbook, data, currency);
  addInvestmentsSheet(workbook, data, currency);
  addLoansSheet(workbook, data, currency);
  addBudgetsSheet(workbook, data, currency);
  addGoalsSheet(workbook, data, currency);

  return workbook;
}
