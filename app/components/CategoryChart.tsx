'use client';

import { Expense } from '../types/expense';
import { formatCurrency, groupByCategory } from '../lib/utils';

interface Props {
  expenses: Expense[];
}

export default function CategoryChart({ expenses }: Props) {
  const groups = groupByCategory(expenses);
  const total = groups.reduce((s, g) => s + g.total, 0);

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400">
        <span className="text-4xl mb-2">📭</span>
        <p className="text-sm">No data for this period</p>
      </div>
    );
  }

  // Build donut segments
  let cumulative = 0;
  const segments = groups.map((g) => {
    const pct = (g.total / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { ...g, pct, start };
  });

  const radius = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-4">
      {/* Donut chart */}
      <div className="flex items-center justify-center">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {segments.map((seg, i) => {
            const dasharray = (seg.pct / 100) * circumference;
            const dashoffset = circumference - (seg.start / 100) * circumference;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="28"
                strokeDasharray={`${dasharray} ${circumference - dasharray}`}
                strokeDashoffset={dashoffset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
              />
            );
          })}
          <text x={cx} y={cy - 6} textAnchor="middle" className="fill-gray-700 text-xs" fontSize="11" fontWeight="600">
            Total
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" className="fill-gray-800" fontSize="12" fontWeight="700">
            {formatCurrency(total)}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.category} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-gray-700">{seg.category}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-24 bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                />
              </div>
              <span className="text-gray-500 w-10 text-right">{seg.pct.toFixed(0)}%</span>
              <span className="font-medium text-gray-700 w-20 text-right">{formatCurrency(seg.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
