export interface Transaction {
  id: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: string;
  description: string;
  paymentMethod: string;
}

export interface Budget {
  id: number;
  category: string;
  amount: string;
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface BudgetWithComparison extends Budget {
  spent: number;
  percentage: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  notes: string;
  total: number;
  status: 'paid' | 'unpaid' | 'overdue';
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  categoryBreakdown: Record<string, number>;
}

export const CATEGORIES = {
  income: ['Sales', 'Services', 'Investment', 'Consulting', 'Other Income'],
  expense: ['Rent', 'Utilities', 'Salaries', 'Marketing', 'Supplies', 'Travel', 'Software', 'Equipment', 'Other Expense']
} as const;

export const PAYMENT_METHODS = ['cash', 'credit_card', 'bank_transfer', 'check', 'paypal'] as const;
