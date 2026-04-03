'use client';

import { useState, useEffect } from 'react';
import { Expense, ExpenseFormData, CATEGORIES, CATEGORY_ICONS } from '../types/expense';
import { getTodayString } from '../lib/utils';

interface Props {
  onSubmit: (data: ExpenseFormData) => void;
  onCancel?: () => void;
  editExpense?: Expense | null;
}

const EMPTY: ExpenseFormData = {
  date: getTodayString(),
  amount: '',
  category: 'Food',
  description: '',
};

interface Errors {
  date?: string;
  amount?: string;
  description?: string;
}

export default function ExpenseForm({ onSubmit, onCancel, editExpense }: Props) {
  const [form, setForm] = useState<ExpenseFormData>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editExpense) {
      setForm({
        date: editExpense.date,
        amount: editExpense.amount.toString(),
        category: editExpense.category,
        description: editExpense.description,
      });
    } else {
      setForm({ ...EMPTY, date: getTodayString() });
    }
    setErrors({});
    setSubmitted(false);
  }, [editExpense]);

  function validate(data: ExpenseFormData): Errors {
    const errs: Errors = {};
    if (!data.date) errs.date = 'Date is required';
    const amt = parseFloat(data.amount);
    if (!data.amount || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount greater than 0';
    if (amt > 1_000_000) errs.amount = 'Amount is too large';
    if (!data.description.trim()) errs.description = 'Description is required';
    if (data.description.trim().length > 200) errs.description = 'Max 200 characters';
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit(form);
    if (!editExpense) setForm({ ...EMPTY, date: getTodayString() });
    setSubmitted(false);
    setErrors({});
  }

  function handleChange(field: keyof ExpenseFormData, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (submitted) setErrors(validate(updated));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
            max={getTodayString()}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.date ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.amount ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => handleChange('category', cat)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all ${
                form.category === cat
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          placeholder="What was this expense for?"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          maxLength={200}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
            errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-xs text-red-500">{errors.description}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400">{form.description.length}/200</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
        >
          {editExpense ? 'Save Changes' : 'Add Expense'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
