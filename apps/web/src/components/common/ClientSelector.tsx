'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { resolveUserTier, getTierLimits } from '@freelanceros/config';
import {
  UserPlus,
  Plus,
  X,
  Loader2,
  Lock,
  Sparkles,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { CustomDetailsSection, CustomFieldItem, formatCustomDetailsSummary } from './CustomDetailsSection';

interface ClientSelectorProps {
  value: string;
  onChange: (clientId: string, client?: any) => void;
  label?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  onClientCreated?: (newClient: any) => void;
}

export function ClientSelector({
  value,
  onChange,
  label = 'Client',
  required = false,
  className = '',
  placeholder = 'Select client...',
  disabled = false,
  onClientCreated,
}: ClientSelectorProps) {
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTierLockModalOpen, setIsTierLockModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states for new client
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientCurrency, setNewClientCurrency] = useState('USD');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.clients.list(),
  });

  // Fetch user info for tier limits
  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.auth.getMe(),
  });

  const userEmail = meData?.user?.email;
  const userPlan =
    meData?.organization?.plan === 'studio' || resolveUserTier(userEmail) === 'studio'
      ? 'studio'
      : 'free';
  const isStudioTier = userPlan === 'studio';
  const limits = getTierLimits(userPlan);
  const clientLimit = limits.activeClients;
  const isAtLimit = !isStudioTier && clients.length >= clientLimit;

  const handleOpenAddClient = () => {
    if (isAtLimit) {
      setIsTierLockModalOpen(true);
    } else {
      setErrorMessage('');
      setIsAddModalOpen(true);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) {
      setErrorMessage('Client name and email are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const compiledNotes = formatCustomDetailsSummary(customFields, newClientNotes);

      const created = await api.clients.create({
        name: newClientName.trim(),
        email: newClientEmail.trim().toLowerCase(),
        company: newClientCompany.trim() || undefined,
        phone: newClientPhone.trim() || undefined,
        currency: newClientCurrency,
        address: newClientAddress.trim() || undefined,
        notes: compiledNotes || undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      // Automatically select newly created client
      onChange(created.id, created);
      if (onClientCreated) onClientCreated(created);

      // Reset modal state
      setNewClientName('');
      setNewClientEmail('');
      setNewClientCompany('');
      setNewClientPhone('');
      setNewClientAddress('');
      setNewClientNotes('');
      setCustomFields([]);
      setIsAddModalOpen(false);
    } catch (err: any) {
      const msg = err.message || 'Error creating client';
      if (msg.includes('Free tier is limited') || msg.includes('limit')) {
        setIsAddModalOpen(false);
        setIsTierLockModalOpen(true);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label & "+ New Client" inline button */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={handleOpenAddClient}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-900 dark:text-neutral-100 hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3 h-3" />
          <span>New Client</span>
          <span className="text-[10px] text-muted-foreground font-mono">
            ({clients.length}/{clientLimit === Infinity ? '∞' : clientLimit})
          </span>
        </button>
      </div>

      {/* Select input + Add client button */}
      <div className="flex items-center gap-2">
        <select
          value={value || ''}
          onChange={(e) => {
            const selectedId = e.target.value;
            const foundClient = clients.find((c) => c.id === selectedId);
            onChange(selectedId, foundClient);
          }}
          required={required}
          disabled={disabled}
          className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors disabled:opacity-50"
        >
          <option value="">{placeholder}</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.company ? `(${c.company})` : ''}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleOpenAddClient}
          title="Add a new client to database"
          className="px-2.5 py-1.5 text-xs font-medium border border-border bg-card hover:bg-muted rounded-md text-foreground flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* TIER LIMIT LOCK POPUP */}
      {isTierLockModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTierLockModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100"
        >
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Client Limit Reached (3 / 3)
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Starter Free Plan Cap
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTierLockModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>
                Your account is currently active on the <strong className="text-foreground">Starter Free Tier</strong>, which permits up to 3 active clients.
              </p>
              <p>
                Upgrading to the <strong className="text-foreground">Studio Tier</strong> unlocks unlimited clients and multi-creator collaboration.
              </p>
              <div className="pt-2 border-t border-border/60 text-[11px] text-foreground font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  Self-service subscription upgrades are temporarily locked while payment checkout is undergoing final testing.
                </span>
              </div>
              <p className="text-[11px]">
                You will receive a notification as soon as online credit card billing and tier switching go live.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsTierLockModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-md bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD CLIENT MODAL */}
      {isAddModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100 overflow-y-auto"
        >
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-5 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Add New Client to Database</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Client / Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Miller or Acme Corp"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@acmecorp.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Global Inc"
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2831"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Currency
                  </label>
                  <select
                    value={newClientCurrency}
                    onChange={(e) => setNewClientCurrency(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Billing Address (Optional)
                </label>
                <input
                  type="text"
                  placeholder="500 Howard St, San Francisco, CA 94105"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              {/* Custom Details & Specifications */}
              <CustomDetailsSection
                fields={customFields}
                onChange={setCustomFields}
                notes={newClientNotes}
                onNotesChange={setNewClientNotes}
                title="Custom Details & Client Notes"
                buttonLabel="+ Add Custom Detail / Spec"
                notesPlaceholder="Add special billing terms, NDA status, or communication preferences..."
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-medium rounded-md bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save & Select Client</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
