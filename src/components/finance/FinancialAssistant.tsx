import { useState, useMemo } from 'react';
import { 
  Plus, TrendingUp, TrendingDown, DollarSign, FileText, 
  PieChart, Download, Search, Edit, Trash2, BarChart3,
  Wallet, AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Transaction, Budget, Invoice, CATEGORIES } from '@/types/finance';
import { MetricCard } from './MetricCard';
import { TransactionModal } from './TransactionModal';
import { BudgetModal } from './BudgetModal';
import { InvoiceModal } from './InvoiceModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type TabId = 'dashboard' | 'transactions' | 'budgets' | 'invoices' | 'reports';

const TABS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'transactions', label: 'Transactions', icon: DollarSign },
  { id: 'budgets', label: 'Budgets', icon: PieChart },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'reports', label: 'Reports', icon: TrendingUp },
];

export function FinancialAssistant() {
  const { toast } = useToast();
  const {
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
  } = useFinanceData();

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');

  // Modal states
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      
      let matchesDate = true;
      if (filterDateRange !== 'all') {
        const tDate = new Date(t.date);
        const now = new Date();
        if (filterDateRange === 'week') {
          matchesDate = (now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24) <= 7;
        } else if (filterDateRange === 'month') {
          matchesDate = tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        }
      }
      
      return matchesSearch && matchesCategory && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterCategory, filterDateRange]);

  // Transaction handlers
  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => 
        t.id === editingTransaction.id ? { ...data, id: editingTransaction.id } : t
      ));
      toast({ title: 'Transaction updated successfully' });
    } else {
      setTransactions(prev => [...prev, { ...data, id: Date.now() }]);
      toast({ title: 'Transaction added successfully' });
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Transaction deleted', variant: 'destructive' });
  };

  // Budget handlers
  const handleAddBudget = (data: Omit<Budget, 'id'>) => {
    if (editingBudget) {
      setBudgets(prev => prev.map(b => 
        b.id === editingBudget.id ? { ...data, id: editingBudget.id } : b
      ));
      toast({ title: 'Budget updated successfully' });
    } else {
      setBudgets(prev => [...prev, { ...data, id: Date.now() }]);
      toast({ title: 'Budget created successfully' });
    }
    setEditingBudget(null);
  };

  const handleDeleteBudget = (id: number) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    toast({ title: 'Budget deleted', variant: 'destructive' });
  };

  // Invoice handlers
  const handleAddInvoice = (data: Omit<Invoice, 'id' | 'total' | 'status'>) => {
    const total = data.items.reduce((sum, item) => 
      sum + (item.quantity * parseFloat(item.rate || '0')), 0
    );
    
    if (editingInvoice) {
      setInvoices(prev => prev.map(inv => 
        inv.id === editingInvoice.id 
          ? { ...data, id: editingInvoice.id, total, status: editingInvoice.status }
          : inv
      ));
      toast({ title: 'Invoice updated successfully' });
    } else {
      setInvoices(prev => [...prev, { ...data, id: Date.now(), total, status: 'unpaid' }]);
      toast({ title: 'Invoice created successfully' });
    }
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (id: number) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Invoice deleted', variant: 'destructive' });
  };

  const toggleInvoiceStatus = (id: number) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id 
        ? { ...inv, status: inv.status === 'paid' ? 'unpaid' : 'paid' }
        : inv
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">FinanceFlow</h1>
          </div>
          <p className="text-primary-foreground/80">Complete financial management for your business</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-4 border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Monthly Income"
                value={metrics.totalIncome}
                icon={TrendingUp}
                trend="up"
              />
              <MetricCard
                title="Monthly Expenses"
                value={metrics.totalExpenses}
                icon={TrendingDown}
                trend="down"
              />
              <MetricCard
                title="Net Profit"
                value={metrics.netProfit}
                icon={DollarSign}
                trend={metrics.netProfit >= 0 ? 'up' : 'down'}
              />
              <MetricCard
                title="Pending Invoices"
                value={pendingInvoicesCount.toString()}
                icon={FileText}
                trend="neutral"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border/50">
                <h3 className="text-lg font-bold mb-4 text-card-foreground">Recent Transactions</h3>
                <div className="space-y-3">
                  {transactions.slice(-5).reverse().map(t => (
                    <div key={t.id} className="flex justify-between items-center border-b border-border/50 pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-card-foreground">{t.description}</p>
                        <p className="text-sm text-muted-foreground">{t.category} • {t.date}</p>
                      </div>
                      <p className={`font-bold ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                        {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No transactions yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border/50">
                <h3 className="text-lg font-bold mb-4 text-card-foreground">Expense Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(metrics.categoryBreakdown)
                    .filter(([_, amount]) => amount > 0)
                    .sort(([_, a], [__, b]) => b - a)
                    .slice(0, 5)
                    .map(([category, amount]) => (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-card-foreground">{category}</span>
                          <span className="text-sm font-bold text-card-foreground">${amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((amount / metrics.totalExpenses) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  {Object.keys(metrics.categoryBreakdown).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <PieChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No expense data yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
              <Button onClick={() => { setEditingTransaction(null); setTransactionModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Add Transaction
              </Button>
            </div>

            {/* Filters */}
            <div className="bg-card p-4 rounded-lg shadow-sm border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">All Categories</option>
                  {[...CATEGORIES.income, ...CATEGORIES.expense].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-card rounded-lg shadow-sm border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Description</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Amount</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredTransactions.map(transaction => (
                      <tr key={transaction.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground">{transaction.date}</td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{transaction.description}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{transaction.category}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.type === 'income' 
                              ? 'bg-success/10 text-success' 
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold text-right ${
                          transaction.type === 'income' ? 'text-success' : 'text-destructive'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => { setEditingTransaction(transaction); setTransactionModalOpen(true); }}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-foreground">Budget Management</h2>
              <Button onClick={() => { setEditingBudget(null); setBudgetModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Add Budget
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgetComparison.map(budget => (
                <div key={budget.id} className="bg-card p-6 rounded-lg shadow-sm border border-border/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground">{budget.category}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingBudget(budget); setBudgetModalOpen(true); }}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent: ${budget.spent.toFixed(2)}</span>
                      <span className="text-muted-foreground">Budget: ${parseFloat(budget.amount).toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          budget.percentage > 100 ? 'bg-destructive' : 
                          budget.percentage > 80 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {budget.percentage > 100 && <AlertCircle className="h-4 w-4 text-destructive" />}
                      <p className={`text-sm font-medium ${
                        budget.percentage > 100 ? 'text-destructive' : 
                        budget.percentage > 80 ? 'text-warning' : 'text-success'
                      }`}>
                        {budget.percentage.toFixed(1)}% used
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {budgets.length === 0 && (
                <div className="col-span-2 text-center py-12 text-muted-foreground bg-card rounded-lg border border-border/50">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No budgets created yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-foreground">Invoices</h2>
              <Button onClick={() => { setEditingInvoice(null); setInvoiceModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Create Invoice
              </Button>
            </div>

            <div className="bg-card rounded-lg shadow-sm border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Invoice #</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Client</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Due Date</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Amount</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Status</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium font-mono text-foreground">{invoice.invoiceNumber}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{invoice.clientName}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.date}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.dueDate}</td>
                        <td className="px-6 py-4 text-sm font-bold text-right text-foreground">${invoice.total.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleInvoiceStatus(invoice.id)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                              invoice.status === 'paid' 
                                ? 'bg-success/10 text-success hover:bg-success/20' 
                                : 'bg-warning/10 text-warning hover:bg-warning/20'
                            }`}
                          >
                            {invoice.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => { setEditingInvoice(invoice); setInvoiceModalOpen(true); }}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {invoices.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No invoices created yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-foreground">Financial Reports</h2>
              <Button onClick={exportData}>
                <Download className="h-4 w-4 mr-2" /> Export Data
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profit & Loss Summary */}
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border/50">
                <h3 className="text-lg font-bold mb-4 text-card-foreground">Profit & Loss Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="font-medium text-card-foreground">Total Income</span>
                    <span className="text-success font-bold">${metrics.totalIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="font-medium text-card-foreground">Total Expenses</span>
                    <span className="text-destructive font-bold">${metrics.totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-bold text-lg text-card-foreground">Net Profit</span>
                    <span className={`font-bold text-lg ${metrics.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ${metrics.netProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border/50">
                <h3 className="text-lg font-bold mb-4 text-card-foreground">Invoice Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="font-medium text-card-foreground">Total Invoices</span>
                    <span className="font-bold text-card-foreground">{invoices.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="font-medium text-card-foreground">Paid</span>
                    <span className="text-success font-bold">
                      {invoices.filter(i => i.status === 'paid').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="font-medium text-card-foreground">Pending</span>
                    <span className="text-warning font-bold">{pendingInvoicesCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-bold text-lg text-card-foreground">Pending Amount</span>
                    <span className="text-warning font-bold text-lg">${totalPendingAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Budget Overview */}
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border/50 lg:col-span-2">
                <h3 className="text-lg font-bold mb-4 text-card-foreground">Budget Overview</h3>
                {budgetComparison.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgetComparison.map(budget => (
                      <div key={budget.id} className="p-4 rounded-lg bg-muted/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-card-foreground">{budget.category}</span>
                          <span className={`text-sm font-bold ${
                            budget.percentage > 100 ? 'text-destructive' : 
                            budget.percentage > 80 ? 'text-warning' : 'text-success'
                          }`}>
                            {budget.percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${budget.spent.toFixed(2)} / ${parseFloat(budget.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No budgets to display</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => { setTransactionModalOpen(false); setEditingTransaction(null); }}
        onSubmit={handleAddTransaction}
        editingTransaction={editingTransaction}
      />
      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => { setBudgetModalOpen(false); setEditingBudget(null); }}
        onSubmit={handleAddBudget}
        editingBudget={editingBudget}
      />
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => { setInvoiceModalOpen(false); setEditingInvoice(null); }}
        onSubmit={handleAddInvoice}
        editingInvoice={editingInvoice}
      />
    </div>
  );
}
