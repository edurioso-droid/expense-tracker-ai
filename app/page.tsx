'use client';

import { useState, useMemo } from 'react';
import { Expense, ExpenseFormData } from './types/expense';
import { useExpenses, useFilters } from './lib/hooks';
import { filterExpenses, exportToCSV } from './lib/utils';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseFilters from './components/ExpenseFilters';
import SummaryCards from './components/SummaryCards';
import CategoryChart from './components/CategoryChart';
import MonthlyTrend from './components/MonthlyTrend';
import EditModal from './components/EditModal';

type Tab = 'dashboard' | 'expenses';

export default function Home() {
  const { expenses, loaded, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { filters, setFilter, resetFilters } = useFilters();
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [addSuccess, setAddSuccess] = useState(false);

  const filtered = useMemo(
    () => filterExpenses(expenses, filters.startDate, filters.endDate, filters.category, filters.search),
    [expenses, filters]
  );

  function handleAdd(data: ExpenseFormData) {
    addExpense(data);
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 2000);
  }

  function handleUpdate(id: string, data: ExpenseFormData) {
    updateExpense(id, data);
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-3 animate-pulse">💸</div>
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">💸</span>
            <span className="font-bold text-gray-900 text-lg">ExpenseTracker</span>
          </div>
          <nav className="flex gap-1">
            {(['dashboard', 'expenses'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
          <button
            onClick={() => exportToCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Export filtered expenses to CSV"
          >
            <span>⬇️</span>
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Summary cards always visible */}
        <SummaryCards allExpenses={expenses} filteredExpenses={filtered} />

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Expense */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span>➕</span> Add Expense
                </h2>
                {addSuccess && (
                  <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
                    ✓ Expense added successfully
                  </div>
                )}
                <ExpenseForm onSubmit={handleAdd} />
              </div>
            </div>

            {/* Charts */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span>🍩</span> Spending by Category
                </h2>
                <CategoryChart expenses={filtered} />
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span>📅</span> Monthly Trend (last 6 months)
                </h2>
                <MonthlyTrend expenses={expenses} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filters + List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span>🔎</span> Filter Expenses
                </h2>
                <ExpenseFilters
                  filters={filters}
                  onFilterChange={setFilter}
                  onReset={resetFilters}
                  resultCount={filtered.length}
                />
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>🧾</span> Expenses
                  </h2>
                  {filtered.length > 0 && (
                    <button
                      onClick={() => exportToCSV(filtered)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Export CSV
                    </button>
                  )}
                </div>
                <ExpenseList
                  expenses={filtered}
                  onEdit={setEditExpense}
                  onDelete={deleteExpense}
                />
              </div>
            </div>

            {/* Add form sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-24">
                <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span>➕</span> Add Expense
                </h2>
                {addSuccess && (
                  <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
                    ✓ Expense added successfully
                  </div>
                )}
                <ExpenseForm onSubmit={handleAdd} />
              </div>
            </div>
          </div>
        )}
      </main>

      <EditModal
        expense={editExpense}
        onSave={handleUpdate}
        onClose={() => setEditExpense(null)}
      />
    </div>
  );
}
