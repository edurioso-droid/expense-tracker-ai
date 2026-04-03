'use client';

import { Expense } from '../types/expense';
import { formatCurrency } from '../lib/utils';

interface Props {
  expenses: Expense[];
}

interface MonthData {
  label: string;
  total: number;
  key: string;
}

export default function MonthlyTrend({ expenses }: Props) {
  // Group by month, last 6 months
  const monthMap: Record<string, number> = {};
  for (const e of expenses) {
    const key = e.date.slice(0, 7); // YYYY-MM
    monthMap[key] = (monthMap[key] ?? 0) + e.amount;
  }

  const months: MonthData[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    months.push({ label, total: monthMap[key] ?? 0, key });
  }

  const maxVal = Math.max(...months.map((m) => m.total), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2 h-32">
        {months.map((m) => {
          const heightPct = (m.total / maxVal) * 100;
          const isCurrentMonth = m.key === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          return (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">
                {m.total > 0 ? formatCurrency(m.total).replace('$', '$') : ''}
              </span>
              <div className="w-full flex items-end" style={{ height: '80px' }}>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    isCurrentMonth ? 'bg-indigo-500' : 'bg-indigo-200'
                  }`}
                  style={{ height: `${Math.max(heightPct, 2)}%` }}
                  title={formatCurrency(m.total)}
                />
              </div>
              <span className={`text-xs ${isCurrentMonth ? 'font-bold text-indigo-600' : 'text-gray-400'}`}>
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
