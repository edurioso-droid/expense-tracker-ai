'use client';

import { useState } from 'react';
import { Expense, CATEGORY_COLORS, CATEGORY_ICONS } from '../types/expense';
import { formatCurrency, formatDate } from '../lib/utils';

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="text-5xl mb-3">🧾</span>
        <p className="text-sm font-medium">No expenses found</p>
        <p className="text-xs mt-1">Try adjusting your filters or add a new expense</p>
      </div>
    );
  }

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  }

  return (
    <div className="divide-y divide-gray-100">
      {expenses.map((expense) => {
        const color = CATEGORY_COLORS[expense.category];
        const icon = CATEGORY_ICONS[expense.category];
        const isConfirming = confirmDelete === expense.id;

        return (
          <div
            key={expense.id}
            className="flex items-center gap-3 py-3 px-1 hover:bg-gray-50 rounded-lg transition-colors group"
          >
            {/* Category icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: `${color}18` }}
            >
              {icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{expense.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${color}18`, color }}
                >
                  {expense.category}
                </span>
                <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
              </div>
            </div>

            {/* Amount */}
            <span className="text-sm font-bold text-gray-800 flex-shrink-0">
              {formatCurrency(expense.amount)}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onEdit(expense)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-xs"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(expense.id)}
                className={`p-1.5 rounded-lg transition-colors text-xs ${
                  isConfirming
                    ? 'text-white bg-red-500 hover:bg-red-600'
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                }`}
                title={isConfirming ? 'Click again to confirm' : 'Delete'}
                onBlur={() => setConfirmDelete(null)}
              >
                {isConfirming ? '✓' : '🗑️'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
