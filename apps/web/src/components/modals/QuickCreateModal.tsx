'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';

export function QuickCreateModal() {
  const queryClient = useQueryClient();
  const { quickCreateType, closeQuickCreate } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Query clients and projects for selector dropdowns
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.clients.list(),
    enabled: Boolean(quickCreateType),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
    enabled: Boolean(quickCreateType),
  });

  if (!quickCreateType) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (quickCreateType === 'client') {
        await api.clients.create({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          currency: 'INR',
        });
        queryClient.invalidateQueries({ queryKey: ['clients'] });
      } else if (quickCreateType === 'lead') {
        await api.leads.create({
          title: formData.title,
          clientName: formData.clientName,
          company: formData.company,
          value: Number(formData.value || 0),
          expectedCloseDate: formData.expectedCloseDate,
          currency: 'INR',
        });
        queryClient.invalidateQueries({ queryKey: ['leads'] });
      } else if (quickCreateType === 'project') {
        await api.projects.create({
          name: formData.name,
          clientId: formData.clientId || (clients[0] ? clients[0].id : ''),
          budget: Number(formData.budget || 0),
          deadline: formData.deadline,
          includedRevisions: Number(formData.includedRevisions || 2),
          currency: 'INR',
        });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      } else if (quickCreateType === 'proposal') {
        await api.proposals.create({
          title: formData.title,
          clientId: formData.clientId || (clients[0] ? clients[0].id : ''),
          validUntil: formData.validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          currency: 'INR',
          items: [
            {
              description: formData.itemDescription || 'Creative Project Scope',
              quantity: 1,
              unitPrice: Number(formData.amount || 50000),
            },
          ],
        });
        queryClient.invalidateQueries({ queryKey: ['proposals'] });
      } else if (quickCreateType === 'invoice') {
        await api.invoices.create({
          title: formData.title,
          clientId: formData.clientId || (clients[0] ? clients[0].id : ''),
          projectId: formData.projectId || null,
          dueDate: formData.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          currency: 'INR',
          items: [
            {
              description: formData.itemDescription || 'Deliverables & Services',
              quantity: 1,
              unitPrice: Number(formData.amount || 25000),
            },
          ],
        });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      } else if (quickCreateType === 'expense') {
        await api.expenses.create({
          vendor: formData.vendor,
          category: formData.category || 'software',
          amount: Number(formData.amount || 0),
          projectId: formData.projectId || null,
          currency: 'INR',
          date: formData.date || new Date().toISOString().split('T')[0],
        });
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
      }

      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setFormData({});
      closeQuickCreate();
    } catch (err: any) {
      alert(err.message || 'Error creating entity');
    } finally {
      setIsLoading(false);
    }
  };

  const titles: Record<string, string> = {
    client: 'New Client',
    lead: 'New Sales Lead',
    project: 'New Project',
    proposal: 'New Proposal',
    invoice: 'New Invoice',
    expense: 'Log Expense',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-md bg-card rounded-lg border border-border shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">{titles[quickCreateType]}</h2>
          <button
            onClick={closeQuickCreate}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {quickCreateType === 'client' && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Client Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Acme Corp or Sarah Miller"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Email *</label>
                <input
                  required
                  type="email"
                  placeholder="client@company.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Company</label>
                <input
                  type="text"
                  placeholder="Acme Global Inc"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+91 98200 12345"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </>
          )}

          {quickCreateType === 'lead' && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Lead Opportunity Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Brand Film Campaign"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Prospect / Company *</label>
                <input
                  required
                  type="text"
                  placeholder="Northstar Luxury"
                  value={formData.clientName || ''}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Estimated Value (₹)</label>
                  <input
                    type="number"
                    placeholder="150000"
                    value={formData.value || ''}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Expected Close</label>
                  <input
                    type="date"
                    value={formData.expectedCloseDate || ''}
                    onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>
            </>
          )}

          {quickCreateType === 'project' && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Project Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Commercial Hero Edit 2026"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Client *</label>
                <select
                  required
                  value={formData.clientId || ''}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    placeholder="120000"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Included Revisions</label>
                <input
                  type="number"
                  defaultValue={2}
                  value={formData.includedRevisions || 2}
                  onChange={(e) => setFormData({ ...formData, includedRevisions: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </>
          )}

          {quickCreateType === 'proposal' && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Proposal Title *</label>
                <input
                  required
                  type="text"
                  placeholder="Product Teaser Video Package"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Client *</label>
                <select
                  required
                  value={formData.clientId || ''}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Amount (₹) *</label>
                <input
                  required
                  type="number"
                  placeholder="85000"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </>
          )}

          {quickCreateType === 'invoice' && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Invoice Title *</label>
                <input
                  required
                  type="text"
                  placeholder="Production Milestone 1 (50%)"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Client *</label>
                <select
                  required
                  value={formData.clientId || ''}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    placeholder="60000"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>
            </>
          )}

          {quickCreateType === 'expense' && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Vendor *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Musicbed or Adobe"
                  value={formData.vendor || ''}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Category</label>
                  <select
                    value={formData.category || 'software'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    <option value="software">Software</option>
                    <option value="travel">Travel</option>
                    <option value="equipment">Equipment</option>
                    <option value="marketing">Marketing</option>
                    <option value="contractors">Contractors</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    placeholder="4500"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Associated Project</label>
                <select
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="">None (Workspace General)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeQuickCreate}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md text-xs font-medium transition-colors"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
