'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { ClientSelector } from '@/components/common/ClientSelector';
import {
  CustomDetailsSection,
  CustomFieldItem,
  formatCustomDetailsSummary,
} from '@/components/common/CustomDetailsSection';

export function QuickCreateModal() {
  const queryClient = useQueryClient();
  const quickCreateType = useAppStore((s) => s.quickCreateType);
  const closeQuickCreate = useAppStore((s) => s.closeQuickCreate);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);
  const [customNotes, setCustomNotes] = useState('');

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

  const handleClose = () => {
    setFormData({});
    setCustomFields([]);
    setCustomNotes('');
    closeQuickCreate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const compiledDetails = formatCustomDetailsSummary(customFields, customNotes);

      if (quickCreateType === 'client') {
        await api.clients.create({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          currency: 'INR',
          notes: compiledDetails || undefined,
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
          notes: compiledDetails || undefined,
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
          description: formData.description
            ? `${formData.description}\n\n${compiledDetails}`
            : compiledDetails || undefined,
          notes: compiledDetails || undefined,
        });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      } else if (quickCreateType === 'proposal') {
        await api.proposals.create({
          title: formData.title,
          clientId: formData.clientId || (clients[0] ? clients[0].id : ''),
          validUntil: formData.validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          currency: 'INR',
          notes: compiledDetails || undefined,
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
          notes: compiledDetails || undefined,
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
          notes: compiledDetails || undefined,
        });
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
      } else if (quickCreateType === 'task') {
        const targetProjectId = formData.projectId || (projects[0] ? projects[0].id : '');
        await api.tasks.create({
          projectId: targetProjectId,
          title: formData.title || 'New Task',
          priority: formData.priority || 'medium',
          dueDate: formData.dueDate,
          status: 'todo',
          description: compiledDetails || undefined,
        });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      } else if (quickCreateType === 'quote') {
        await api.quotes.create({
          title: formData.title || 'Production Quote',
          clientId: formData.clientId || (clients[0] ? clients[0].id : ''),
          projectId: formData.projectId || null,
          validUntil: formData.validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          currency: 'INR',
          notes: compiledDetails || undefined,
          items: [
            {
              description: formData.itemDescription || 'Scope deliverables & licenses',
              quantity: 1,
              unitPrice: Number(formData.amount || 45000),
            },
          ],
        });
        queryClient.invalidateQueries({ queryKey: ['quotes'] });
      } else if (quickCreateType === 'deliverable') {
        const targetProjectId = formData.projectId || (projects[0] ? projects[0].id : '');
        await api.deliverables.create({
          projectId: targetProjectId,
          title: formData.title || 'Master Video Asset',
          description: formData.description
            ? `${formData.description}\n\n${compiledDetails}`
            : compiledDetails || 'Master cut for client review',
          includedRevisions: Number(formData.includedRevisions || 2),
        });
        queryClient.invalidateQueries({ queryKey: ['deliverables'] });
        queryClient.invalidateQueries({ queryKey: ['projectDeliverables'] });
      } else if (quickCreateType === 'time') {
        const targetProjectId = formData.projectId || (projects[0] ? projects[0].id : '');
        const durationMinutes = Number(
          formData.durationMinutes ||
            (formData.durationHours ? Number(formData.durationHours) * 60 : 60)
        );
        await api.time.create({
          projectId: targetProjectId,
          description: compiledDetails
            ? `${formData.description || 'Focus production session'} — ${compiledDetails}`
            : formData.description || 'Focus production session',
          durationMinutes,
          date: formData.date || new Date().toISOString().split('T')[0],
          billable: true,
        });
        queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      }

      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      handleClose();
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
    task: 'New Task',
    proposal: 'New Proposal',
    quote: 'New Quote',
    invoice: 'New Invoice',
    expense: 'Log Expense',
    time: 'Log Time Entry',
    deliverable: 'New Deliverable',
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100"
    >
      <div className="w-full max-w-md bg-card rounded-lg sm:rounded-xl border border-border shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold text-foreground">{titles[quickCreateType]}</h2>
          <button
            onClick={handleClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
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
              <CustomDetailsSection
                fields={customFields}
                onChange={setCustomFields}
                notes={customNotes}
                onNotesChange={setCustomNotes}
                buttonLabel="+ Add Custom Detail / Note"
                notesPlaceholder="Add special terms, NDA status, or communication notes..."
              />
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
              <CustomDetailsSection
                fields={customFields}
                onChange={setCustomFields}
                notes={customNotes}
                onNotesChange={setCustomNotes}
                buttonLabel="+ Add Custom Detail / Spec"
              />
            </>
          )}

          {quickCreateType === 'project' && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Project Template</label>
                <select
                  value={formData.template || 'custom'}
                  onChange={(e) => {
                    const tmpl = e.target.value;
                    if (tmpl === 'video') {
                      setFormData({
                        ...formData,
                        template: tmpl,
                        name: formData.name || 'Commercial Video Production',
                        budget: 150000,
                        includedRevisions: 3,
                      });
                    } else if (tmpl === 'brand') {
                      setFormData({
                        ...formData,
                        template: tmpl,
                        name: formData.name || 'Brand Identity & Guidelines',
                        budget: 85000,
                        includedRevisions: 2,
                      });
                    } else if (tmpl === 'web') {
                      setFormData({
                        ...formData,
                        template: tmpl,
                        name: formData.name || 'Full-Stack Web MVP',
                        budget: 125000,
                        includedRevisions: 2,
                      });
                    } else if (tmpl === 'retainer') {
                      setFormData({
                        ...formData,
                        template: tmpl,
                        name: formData.name || 'Monthly Creative Retainer',
                        budget: 60000,
                        includedRevisions: 4,
                      });
                    } else {
                      setFormData({ ...formData, template: 'custom' });
                    }
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="custom">Blank Custom Project</option>
                  <option value="video">Commercial Video Production (3 Revisions • ₹1.5L)</option>
                  <option value="brand">Brand Identity & Guidelines (2 Revisions • ₹85k)</option>
                  <option value="web">Full-Stack Web MVP (2 Revisions • ₹1.25L)</option>
                  <option value="retainer">Monthly Creative Retainer (4 Revisions • ₹60k)</option>
                </select>
              </div>
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

              {/* Universal Client Selector with inline "+ New Client" */}
              <ClientSelector
                value={formData.clientId || ''}
                onChange={(id) => setFormData({ ...formData, clientId: id })}
                label="Target Client"
                required
              />

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
                  value={formData.includedRevisions || 2}
                  onChange={(e) => setFormData({ ...formData, includedRevisions: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <CustomDetailsSection
                fields={customFields}
                onChange={setCustomFields}
                notes={customNotes}
                onNotesChange={setCustomNotes}
                buttonLabel="+ Add Custom Detail / Spec"
              />
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

              {/* Universal Client Selector */}
              <ClientSelector
                value={formData.clientId || ''}
                onChange={(id) => setFormData({ ...formData, clientId: id })}
                label="Target Client"
                required
              />

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

              <CustomDetailsSection
                fields={customFields}
                onChange={setCustomFields}
                notes={customNotes}
                onNotesChange={setCustomNotes}
                buttonLabel="+ Add Custom Detail / Scope Note"
              />
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

              {/* Universal Client Selector */}
              <ClientSelector
                value={formData.clientId || ''}
                onChange={(id) => setFormData({ ...formData, clientId: id })}
                label="Target Client"
                required
              />

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

              <CustomDetailsSection
                fields={customFields}
                onChange={setCustomFields}
                notes={customNotes}
                onNotesChange={setCustomNotes}
                buttonLabel="+ Add Custom Detail / Payment Note"
              />
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

              <CustomDetailsSection
                fields={customFields}
                onChange={setCustomFields}
                notes={customNotes}
                onNotesChange={setCustomNotes}
                buttonLabel="+ Add Custom Detail / Receipt Note"
              />
            </>
          )}

          {quickCreateType === 'task' && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Task Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Export 9:16 cuts or Review client color notes"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Project *</label>
                <select
                  required
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Priority</label>
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
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

              <CustomDetailsSection
                fields={customFields}
                onChange={setCustomFields}
                notes={customNotes}
                onNotesChange={setCustomNotes}
                buttonLabel="+ Add Custom Detail / Spec"
              />
            </>
          )}

          {quickCreateType === 'quote' && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Quote Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Video Production & Editorial Estimate"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              {/* Universal Client Selector */}
              <ClientSelector
                value={formData.clientId || ''}
                onChange={(id) => setFormData({ ...formData, clientId: id })}
                label="Target Client"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Estimated Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    placeholder="45000"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil || ''}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              <CustomDetailsSection
                fields={customFields}
                onChange={setCustomFields}
                notes={customNotes}
                onNotesChange={setCustomNotes}
                buttonLabel="+ Add Custom Detail / Terms"
              />
            </>
          )}

          {quickCreateType === 'deliverable' && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Deliverable Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Master 4K ProRes Film Cut"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Project *</label>
                <select
                  required
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Included Revisions</label>
                  <input
                    type="number"
                    value={formData.includedRevisions || 2}
                    onChange={(e) => setFormData({ ...formData, includedRevisions: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Final delivery specs"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              <CustomDetailsSection
                fields={customFields}
                onChange={setCustomFields}
                notes={customNotes}
                onNotesChange={setCustomNotes}
                buttonLabel="+ Add Custom Detail / Spec"
              />
            </>
          )}

          {quickCreateType === 'time' && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Project *</label>
                <select
                  required
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Activity / Focus Description *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sound design pass and audio stem conform"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Duration (Hours) *</label>
                  <input
                    required
                    type="number"
                    step="0.25"
                    placeholder="2.5"
                    value={formData.durationHours || ''}
                    onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              <CustomDetailsSection
                fields={customFields}
                onChange={setCustomFields}
                notes={customNotes}
                onNotesChange={setCustomNotes}
                buttonLabel="+ Add Custom Detail / Note"
              />
            </>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
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
