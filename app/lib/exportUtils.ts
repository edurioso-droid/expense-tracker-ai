import { Expense, Category } from '../types/expense';
import { formatCurrency, formatDate } from './utils';

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportConfig {
  format: ExportFormat;
  startDate: string;
  endDate: string;
  categories: Category[];
  filename: string;
}

export function applyExportFilters(expenses: Expense[], config: ExportConfig): Expense[] {
  return expenses.filter((e) => {
    if (config.startDate && e.date < config.startDate) return false;
    if (config.endDate && e.date > config.endDate) return false;
    if (config.categories.length > 0 && !config.categories.includes(e.category)) return false;
    return true;
  });
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function runCSVExport(expenses: Expense[], filename: string): void {
  const header = ['Date', 'Category', 'Amount', 'Description'];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
  triggerDownload(csv, `${filename}.csv`, 'text/csv');
}

export function runJSONExport(expenses: Expense[], filename: string): void {
  const data = expenses.map((e) => ({
    date: e.date,
    category: e.category,
    amount: e.amount,
    description: e.description,
  }));
  triggerDownload(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
}

export function runPDFExport(expenses: Expense[], filename: string): void {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const rows = expenses
    .map(
      (e) => `
      <tr>
        <td>${formatDate(e.date)}</td>
        <td>${e.category}</td>
        <td class="amount">${formatCurrency(e.amount)}</td>
        <td>${e.description}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 32px; color: #1f2937; }
    h1 { font-size: 20px; color: #4f46e5; margin: 0 0 4px; }
    .meta { color: #9ca3af; font-size: 11px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #4f46e5; color: white; padding: 9px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    .amount { text-align: right; font-weight: 600; }
    tfoot td { border-top: 2px solid #4f46e5; font-weight: 700; padding-top: 10px; }
    @media print { @page { margin: 24px; } }
  </style>
</head>
<body>
  <h1>Expense Report</h1>
  <p class="meta">
    Generated ${new Date().toLocaleString()} &nbsp;·&nbsp;
    ${expenses.length} record${expenses.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
    Total: ${formatCurrency(total)}
  </p>
  <table>
    <thead>
      <tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th></tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="2"></td>
        <td class="amount">${formatCurrency(total)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
