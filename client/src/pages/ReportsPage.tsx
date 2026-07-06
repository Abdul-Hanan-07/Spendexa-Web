import { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Eye, FileSpreadsheet, FileText } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { ReportDateRangeFilter, EMPTY_RANGE } from '../components/reports/ReportDateRangeFilter';
import type { ReportDateRangeState } from '../components/reports/ReportDateRangeFilter';
import { ReportPreviewModal } from '../components/reports/ReportPreviewModal';
import { api } from '../lib/api';
import type { ReportPreview, ReportRangeParams } from '../lib/api';

function toApiParams(range: ReportDateRangeState): ReportRangeParams {
  return {
    startDate: range.startDate ? new Date(`${range.startDate}T00:00:00`).toISOString() : undefined,
    endDate: range.endDate ? new Date(`${range.endDate}T23:59:59`).toISOString() : undefined,
  };
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function triggerView(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function ReportsPage() {
  const [range, setRange] = useState<ReportDateRangeState>(EMPTY_RANGE);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ReportPreview | null>(null);

  const [excelDownloading, setExcelDownloading] = useState(false);
  const [pdfViewing, setPdfViewing] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  async function handlePreview() {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const data = await api.getReportPreview(toApiParams(range));
      setPreviewData(data);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleDownloadExcel() {
    setExcelDownloading(true);
    try {
      const { blob, filename } = await api.downloadExcelReport(toApiParams(range));
      triggerDownload(blob, filename);
      toast.success('Excel report downloaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download Excel report');
    } finally {
      setExcelDownloading(false);
    }
  }

  async function handleViewPdf() {
    setPdfViewing(true);
    try {
      const { blob } = await api.viewPdfReport(toApiParams(range));
      triggerView(blob);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open PDF report');
    } finally {
      setPdfViewing(false);
    }
  }

  async function handleDownloadPdf() {
    setPdfDownloading(true);
    try {
      const { blob, filename } = await api.downloadPdfReport(toApiParams(range));
      triggerDownload(blob, filename);
      toast.success('PDF report downloaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download PDF report');
    } finally {
      setPdfDownloading(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Reports</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
            Generate and export financial reports for any date range.
          </p>
        </div>

        <ReportDateRangeFilter range={range} onChange={setRange} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card card-lift p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-700 dark:text-amber-500">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Excel Report</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-500">
                  Multi-sheet workbook with summary, transactions, investments, loans, budgets and goals.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <button
                type="button"
                onClick={handlePreview}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 px-4 py-2.5 rounded-lg transition-colors"
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                type="button"
                onClick={handleDownloadExcel}
                disabled={excelDownloading}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400 disabled:opacity-60 px-4 py-2.5 rounded-lg transition-colors"
              >
                <Download size={16} />
                {excelDownloading ? 'Generating…' : 'Download Excel'}
              </button>
            </div>
          </div>

          <div className="card card-lift p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-700 dark:text-amber-500">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">PDF Report</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-500">
                  Branded financial report with summary cards, tables and charts, ready to print or share.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <button
                type="button"
                onClick={handleViewPdf}
                disabled={pdfViewing}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-60 px-4 py-2.5 rounded-lg transition-colors"
              >
                <Eye size={16} />
                {pdfViewing ? 'Generating…' : 'View Report'}
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={pdfDownloading}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400 disabled:opacity-60 px-4 py-2.5 rounded-lg transition-colors"
              >
                <Download size={16} />
                {pdfDownloading ? 'Generating…' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReportPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        loading={previewLoading}
        error={previewError}
        data={previewData}
      />
    </AppLayout>
  );
}
