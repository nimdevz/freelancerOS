'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@freelanceros/ui';
import {
  Receipt,
  Plus,
  Filter,
  DollarSign,
  TrendingDown,
  Building,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const { openQuickCreate } = useAppStore();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('software');
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [taxDeductible, setTaxDeductible] = useState(true);

  // Fetch expenses
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => api.expenses.list(),
  });

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.expenses.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateModalOpen(false);
      setDescription('');
      setAmount('');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.expenses.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    createMutation.mutate({
      description,
      amount: Number(amount),
      category,
      projectId: projectId || undefined,
      expenseDate: date,
      taxDeductible,
    });
  };

  const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  const projectExpenses = expenses
    .filter((e) => e.projectId)
    .reduce((acc, exp) => acc + (exp.amount || 0), 0);
  const overheadExpenses = totalExpenses - projectExpenses;
  const taxDeductibleExpenses = expenses
    .filter((e) => e.taxDeductible !== false)
    .reduce((acc, exp) => acc + (exp.amount || 0), 0);

  const filteredExpenses = expenses.filter((e) => {
    if (categoryFilter === 'all') return true;
    return e.category === categoryFilter;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Expenses</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Record business overhead and project-direct costs to monitor real net profit margins.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="text-lg sm:text-xl font-semibold text-foreground mt-1 font-mono">
              {formatCurrency(totalExpenses)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 block">
              {expenses.length} total entries
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Project Direct Costs
            </span>
            <div className="text-lg sm:text-xl font-semibold text-foreground mt-1 font-mono">
              {formatCurrency(projectExpenses)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 block">Tied to client jobs</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Studio Overhead
            </span>
            <div className="text-lg sm:text-xl font-semibold text-foreground mt-1 font-mono">
              {formatCurrency(overheadExpenses)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 block">General software & tools</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Tax Deductible
            </span>
            <div className="text-lg sm:text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {formatCurrency(taxDeductibleExpenses)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 block">Eligible write-offs</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
          {['all', 'software', 'contractors', 'assets', 'hardware', 'travel'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs rounded-md font-medium capitalize whitespace-nowrap shrink-0 transition-colors ${
                categoryFilter === cat
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Expenses Table */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-900/50 text-muted-foreground font-medium">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Project Allocation</th>
                  <th className="py-2.5 px-4">Deductible</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No expenses recorded matching category.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => {
                    const project = projects.find((p) => p.id === exp.projectId);
                    return (
                      <tr key={exp.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground font-mono">
                          {formatDate(exp.expenseDate || exp.createdAt)}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {exp.description}
                        </td>
                        <td className="py-3 px-4 capitalize font-mono text-muted-foreground">
                          {exp.category}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {project ? (
                            <span className="font-medium text-foreground">{project.name}</span>
                          ) : (
                            <span className="text-muted-foreground italic">Studio Overhead</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              exp.taxDeductible !== false
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                            }`}
                          >
                            {exp.taxDeductible !== false ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                          {formatCurrency(exp.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteMutation.mutate(exp.id)}
                            className="p-1 text-muted-foreground hover:text-red-500 rounded transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Expense Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md p-5 bg-card border border-border rounded-lg shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-foreground">Record Business Expense</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adobe Creative Cloud Subscription, Voiceover Artist"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    >
                      <option value="software">Software / SaaS</option>
                      <option value="contractors">Contractors / Subcontracting</option>
                      <option value="assets">Stock Assets / Fonts / Music</option>
                      <option value="hardware">Equipment / Hardware</option>
                      <option value="travel">Travel / Client Meetings</option>
                      <option value="office">Office / Workspace</option>
                      <option value="other">Other Business Cost</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Associated Project (Optional)
                    </label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    >
                      <option value="">Studio Overhead</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Expense Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                    <input
                      type="checkbox"
                      checked={taxDeductible}
                      onChange={(e) => setTaxDeductible(e.target.checked)}
                      className="rounded border-border text-neutral-900 focus:ring-0"
                    />
                    <span>Tax deductible business expense</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
                  >
                    {createMutation.isPending ? 'Saving...' : 'Record Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
