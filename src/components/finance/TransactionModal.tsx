import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction, CATEGORIES, PAYMENT_METHODS } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  editingTransaction?: Transaction | null;
}

export function TransactionModal({ isOpen, onClose, onSubmit, editingTransaction }: TransactionModalProps) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        date: editingTransaction.date,
        type: editingTransaction.type,
        category: editingTransaction.category,
        amount: editingTransaction.amount,
        description: editingTransaction.description,
        paymentMethod: editingTransaction.paymentMethod,
      });
    } else {
      setForm({
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        paymentMethod: 'cash',
      });
    }
  }, [editingTransaction, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.amount || !form.description) return;
    onSubmit(form);
    onClose();
  };

  if (!isOpen) return null;

  const categories = form.type === 'income' ? CATEGORIES.income : CATEGORIES.expense;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-lg w-full max-w-md mx-4 p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-card-foreground">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense', category: '' })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter description"
              required
            />
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <select
              id="paymentMethod"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingTransaction ? 'Update' : 'Add'} Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
