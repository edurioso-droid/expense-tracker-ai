import { Expense, Category, CATEGORY_COLORS } from '../types/expense';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getMonthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export function filterExpenses(
  expenses: Expense[],
  startDate: string,
  endDate: string,
  category: Category | 'All',
  search: string
): Expense[] {
  return expenses.filter((e) => {
    if (startDate && e.date < startDate) return false;
    if (endDate && e.date > endDate) return false;
    if (category !== 'All' && e.category !== category) return false;
    if (
      search &&
      !e.description.toLowerCase().includes(search.toLowerCase()) &&
      !e.category.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });
}

export function groupByCategory(
  expenses: Expense[]
): { category: Category; total: number; color: string }[] {
  const map: Partial<Record<Category, number>> = {};
  for (const e of expenses) {
    map[e.category] = (map[e.category] ?? 0) + e.amount;
  }
  return Object.entries(map)
    .map(([cat, total]) => ({
      category: cat as Category,
      total: total as number,
      color: CATEGORY_COLORS[cat as Category],
    }))
    .sort((a, b) => b.total - a.total);
}

export function exportToCSV(expenses: Expense[]): void {
  const header = ['Date', 'Amount', 'Category', 'Description'];
  const rows = expenses.map((e) => [
    e.date,
    e.amount.toFixed(2),
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses_${getTodayString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
