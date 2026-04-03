'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFormData, FilterState, Category } from '../types/expense';
import { loadExpenses, saveExpenses, generateId } from './storage';
import { getTodayString, getMonthStart } from './utils';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveExpenses(expenses);
  }, [expenses, loaded]);

  const addExpense = useCallback((data: ExpenseFormData) => {
    const expense: Expense = {
      id: generateId(),
      date: data.date,
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description.trim(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [expense, ...prev]);
    return expense;
  }, []);

  const updateExpense = useCallback((id: string, data: ExpenseFormData) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, date: data.date, amount: parseFloat(data.amount), category: data.category, description: data.description.trim() }
          : e
      )
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { expenses, loaded, addExpense, updateExpense, deleteExpense };
}

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>({
    startDate: getMonthStart(),
    endDate: getTodayString(),
    category: 'All',
    search: '',
  });

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      startDate: getMonthStart(),
      endDate: getTodayString(),
      category: 'All',
      search: '',
    });
  }, []);

  return { filters, setFilter, resetFilters };
}
