import { useState, useCallback, useMemo } from 'react';
import { Transaction, Budget, Invoice, FinancialMetrics, BudgetWithComparison } from '@/types/finance';

const STORAGE_KEYS = {
  transactions: 'finance_transactions',
  budgets: 'finance_budgets',
  invoices: 'finance_invoices',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

export function useFinanceData() {
  const [transactions, setTransactionsState] = useState<Transaction[]>(() => 
    loadFromStorage(STORAGE_KEYS.transactions, [])
  );
  const [budgets, setBudgetsState] = useState<Budget[]>(() => 
    loadFromStorage(STORAGE_KEYS.budgets, [])
  );
  const [invoices, setInvoicesState] = useState<Invoice[]>(() => 
    loadFromStorage(STORAGE_KEYS.invoices, [])
  );

  const setTransactions = useCallback((newTransactions: Transaction[] | ((prev: Transaction[]) => Transaction[])) => {
    setTransactionsState(prev => {
      const updated = typeof newTransactions === 'function' ? newTransactions(prev) : newTransactions;
      saveToStorage(STORAGE_KEYS.transactions, updated);
      return updated;
    });
  }, []);

  const setBudgets = useCallback((newBudgets: Budget[] | ((prev: Budget[]) => Budget[])) => {
    setBudgetsState(prev => {
      const updated = typeof newBudgets === 'function' ? newBudgets(prev) : newBudgets;
      saveToStorage(STORAGE_KEYS.budgets, updated);
      return updated;
    });
  }, []);

  const setInvoices = useCallback((newInvoices: Invoice[] | ((prev: Invoice[]) => Invoice[])) => {
    setInvoicesState(prev => {
      const updated = typeof newInvoices === 'function' ? newInvoices(prev) : newInvoices;
      saveToStorage(STORAGE_KEYS.invoices, updated);
      return updated;
    });
  }, []);

  const metrics: FinancialMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

    const netProfit = totalIncome - totalExpenses;

    const categoryBreakdown: Record<string, number> = {};
    monthlyTransactions.forEach(t => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = 0;
      }
      categoryBreakdown[t.category] += parseFloat(t.amount || '0');
    });

    return { totalIncome, totalExpenses, netProfit, categoryBreakdown };
  }, [transactions]);

  const budgetComparison: BudgetWithComparison[] = useMemo(() => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      const budgetAmount = parseFloat(budget.amount || '0');
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
      return { ...budget, spent, percentage };
    });
  }, [budgets, transactions]);

  const pendingInvoicesCount = useMemo(() => 
    invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').length,
  [invoices]);

  const totalPendingAmount = useMemo(() => 
    invoices
      .filter(i => i.status === 'unpaid' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.total, 0),
  [invoices]);

  const exportData = useCallback(() => {
    const data = { transactions, budgets, invoices, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions, budgets, invoices]);

  return {
    transactions,
    setTransactions,
    budgets,
    setBudgets,
    invoices,
    setInvoices,
    metrics,
    budgetComparison,
    pendingInvoicesCount,
    totalPendingAmount,
    exportData,
  };
}
