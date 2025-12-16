import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Invoice, InvoiceItem } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: Omit<Invoice, 'id' | 'total' | 'status'>) => void;
  editingInvoice?: Invoice | null;
}

export function InvoiceModal({ isOpen, onClose, onSubmit, editingInvoice }: InvoiceModalProps) {
  const [form, setForm] = useState({
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: '' }] as InvoiceItem[],
    notes: '',
  });

  useEffect(() => {
    if (editingInvoice) {
      setForm({
        invoiceNumber: editingInvoice.invoiceNumber,
        clientName: editingInvoice.clientName,
        clientEmail: editingInvoice.clientEmail,
        date: editingInvoice.date,
        dueDate: editingInvoice.dueDate,
        items: editingInvoice.items,
        notes: editingInvoice.notes,
      });
    } else {
      setForm({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        clientName: '',
        clientEmail: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        items: [{ description: '', quantity: 1, rate: '' }],
        notes: '',
      });
    }
  }, [editingInvoice, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName || !form.dueDate || form.items.some(i => !i.description || !i.rate)) return;
    onSubmit(form);
    onClose();
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { description: '', quantity: 1, rate: '' }] });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const removeItem = (index: number) => {
    if (form.items.length > 1) {
      setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
    }
  };

  const total = form.items.reduce((sum, item) => 
    sum + (item.quantity * parseFloat(item.rate || '0')), 0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-lg w-full max-w-2xl mx-4 p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-card-foreground">
            {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={form.invoiceNumber}
                onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                required
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                placeholder="Client name"
                required
              />
            </div>
            <div>
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={form.clientEmail}
                onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                placeholder="client@example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div className="w-28">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={form.items.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-lg font-bold">
              Total: <span className="text-primary">${total.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingInvoice ? 'Update' : 'Create'} Invoice
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
