'use client';

import { Expense, CATEGORY_ICONS } from '../types/expense';
import { formatCurrency, groupByCategory } from '../lib/utils';

interface Props {
  allExpenses: Expense[];
  filteredExpenses: Expense[];
}

export default function SummaryCards({ allExpenses, filteredExpenses }: Props) {
  const filteredTotal = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const allTimeTotal = allExpenses.reduce((s, e) => s + e.amount, 0);
  const avgExpense = filteredExpenses.length > 0 ? filteredTotal / filteredExpenses.length : 0;
  const topCategories = groupByCategory(filteredExpenses).slice(0, 1);
  const topCategory = topCategories[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Filtered Total"
        value={formatCurrency(filteredTotal)}
        sub={`${filteredExpenses.length} expense${filteredExpenses.length !== 1 ? 's' : ''}`}
        color="indigo"
        icon="💰"
      />
      <Card
        label="All-Time Total"
        value={formatCurrency(allTimeTotal)}
        sub={`${allExpenses.length} total`}
        color="emerald"
        icon="📊"
      />
      <Card
        label="Avg per Expense"
        value={formatCurrency(avgExpense)}
        sub="in filtered range"
        color="amber"
        icon="📈"
      />
      <Card
        label="Top Category"
        value={topCategory ? topCategory.category : '—'}
        sub={topCategory ? formatCurrency(topCategory.total) : 'No data'}
        color="rose"
        icon={topCategory ? CATEGORY_ICONS[topCategory.category] : '🏷️'}
      />
    </div>
  );
}

function Card({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose';
  icon: string;
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <span className={`text-lg p-1 rounded-lg ${colors[color]}`}>{icon}</span>
      </div>
      <p className="text-xl font-bold text-gray-800 truncate">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
