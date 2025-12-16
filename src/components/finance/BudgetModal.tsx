import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Budget, CATEGORIES } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (budget: Omit<Budget, 'id'>) => void;
  editingBudget?: Budget | null;
}

export function BudgetModal({ isOpen, onClose, onSubmit, editingBudget }: BudgetModalProps) {
  const [form, setForm] = useState({
    category: '',
    amount: '',
    period: 'monthly' as Budget['period'],
  });

  useEffect(() => {
    if (editingBudget) {
      setForm({
        category: editingBudget.category,
        amount: editingBudget.amount,
        period: editingBudget.period,
      });
    } else {
      setForm({ category: '', amount: '', period: 'monthly' });
    }
  }, [editingBudget, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.amount) return;
    onSubmit(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-lg w-full max-w-md mx-4 p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-card-foreground">
            {editingBudget ? 'Edit Budget' : 'Add Budget'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              {CATEGORIES.expense.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="amount">Budget Amount</Label>
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
            <Label htmlFor="period">Period</Label>
            <select
              id="period"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value as Budget['period'] })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingBudget ? 'Update' : 'Add'} Budget
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
