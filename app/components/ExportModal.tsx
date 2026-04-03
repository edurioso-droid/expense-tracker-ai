'use client';

import { useState, useMemo, useEffect } from 'react';
import { Expense, Category, CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../types/expense';
import { formatCurrency, formatDate, getTodayString } from '../lib/utils';
import {
  ExportFormat,
  applyExportFilters,
  runCSVExport,
  runJSONExport,
  runPDFExport,
} from '../lib/exportUtils';

interface Props {
  expenses: Expense[];
  onClose: () => void;
}

const FORMAT_OPTIONS: { value: ExportFormat; icon: string; label: string; desc: string }[] = [
  { value: 'csv', icon: '📊', label: 'CSV', desc: 'Spreadsheet compatible' },
  { value: 'json', icon: '🔧', label: 'JSON', desc: 'Developer friendly' },
  { value: 'pdf', icon: '📄', label: 'PDF', desc: 'Print & share' },
];

type ExportStatus = 'idle' | 'loading' | 'done';

export default function ExportModal({ expenses, onClose }: Props) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [filename, setFilename] = useState(`expenses_${getTodayString()}`);
  const [status, setStatus] = useState<ExportStatus>('idle');

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filtered = useMemo(
    () =>
      applyExportFilters(expenses, {
        format,
        startDate,
        endDate,
        categories: selectedCategories,
        filename,
      }),
    [expenses, format, startDate, endDate, selectedCategories, filename]
  );

  const total = useMemo(() => filtered.reduce((sum, e) => sum + e.amount, 0), [filtered]);

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleExport() {
    if (filtered.length === 0 || status === 'loading') return;
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 700));
    const name = filename.trim() || 'expenses';
    if (format === 'csv') runCSVExport(filtered, name);
    else if (format === 'json') runJSONExport(filtered, name);
    else runPDFExport(filtered, name);
    setStatus('done');
    setTimeout(() => setStatus('idle'), 3000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">

        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Export Data</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Configure options, preview, then download
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Format selector */}
          <section>
            <SectionLabel>Export Format</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  className={`flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl border-2 transition-all ${
                    format === opt.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span
                    className={`text-sm font-bold ${
                      format === opt.value ? 'text-indigo-700' : 'text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-xs text-gray-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Date range */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>Date Range</SectionLabel>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-xs text-indigo-500 hover:text-indigo-700"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex gap-3 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
              />
              <span className="text-gray-400 font-medium">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Leave empty to include all dates</p>
          </section>

          {/* Categories */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>
                Categories
                <span className="ml-1.5 text-indigo-500 font-normal normal-case tracking-normal">
                  {selectedCategories.length === 0
                    ? '— all included'
                    : `— ${selectedCategories.length} selected`}
                </span>
              </SectionLabel>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-xs text-indigo-500 hover:text-indigo-700"
                >
                  Select all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const color = CATEGORY_COLORS[cat];
                const selected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all"
                    style={
                      selected
                        ? { borderColor: color, backgroundColor: `${color}20`, color }
                        : { borderColor: '#e5e7eb', color: '#6b7280' }
                    }
                  >
                    {CATEGORY_ICONS[cat]} {cat}
                    {selected && <span className="ml-0.5 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Filename */}
          <section>
            <SectionLabel>Filename</SectionLabel>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-1 text-sm px-3 py-2 focus:outline-none text-gray-700"
                spellCheck={false}
              />
              <span className="px-3 py-2 bg-gray-50 border-l border-gray-200 text-sm text-gray-400 font-mono">
                .{format}
              </span>
            </div>
          </section>

          {/* Preview */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Preview</SectionLabel>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full ${
                    filtered.length === 0
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
                {filtered.length > 0 && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="font-semibold text-gray-700">{formatCurrency(total)}</span>
                  </>
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-10 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <span className="text-3xl block mb-2">🔍</span>
                <p className="text-sm font-medium text-gray-500">No records match your filters</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting the date range or categories</p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-y-auto max-h-48">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        {['Date', 'Category', 'Amount', 'Description'].map((col) => (
                          <th
                            key={col}
                            className="text-left px-3 py-2.5 text-gray-500 font-semibold border-b border-gray-200 uppercase tracking-wide text-[10px]"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.slice(0, 50).map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                            {formatDate(e.date)}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-[11px]"
                              style={{
                                backgroundColor: `${CATEGORY_COLORS[e.category]}18`,
                                color: CATEGORY_COLORS[e.category],
                              }}
                            >
                              {CATEGORY_ICONS[e.category]} {e.category}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">
                            {formatCurrency(e.amount)}
                          </td>
                          <td className="px-3 py-2 text-gray-600 max-w-[140px] truncate">
                            {e.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filtered.length > 50 && (
                  <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-400 text-center">
                    Showing first 50 of {filtered.length} records — all will be exported
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={filtered.length === 0 || status === 'loading'}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              status === 'done'
                ? 'bg-green-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {status === 'loading' && (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Preparing export...
              </>
            )}
            {status === 'done' && <>✓ Exported successfully!</>}
            {status === 'idle' && (
              <>
                <span>⬇️</span>
                Export {filtered.length} record{filtered.length !== 1 ? 's' : ''} as{' '}
                {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{children}</p>
  );
}
