'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FREELANCER_TYPES } from '@freelanceros/config';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building,
  DollarSign,
  User,
  FolderKanban,
  Check,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wizard state
  const [freelancerType, setFreelancerType] = useState('video_editor');
  const [workspaceName, setWorkspaceName] = useState('Nimish Studio');
  const [currency, setCurrency] = useState('INR');
  const [hourlyRate, setHourlyRate] = useState('2000');
  const [firstClientName, setFirstClientName] = useState('Apex Innovations');
  const [firstClientEmail, setFirstClientEmail] = useState('contact@apexinnovations.io');
  const [firstProjectName, setFirstProjectName] = useState('Brand Commercial 2026');
  const [firstProjectBudget, setFirstProjectBudget] = useState('150000');
  const [maxIncludedRevisions, setMaxIncludedRevisions] = useState('2');

  const totalSteps = 5;

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await api.organizations.onboard({
        freelancerType,
        workspaceName,
        currency,
        hourlyRate: Number(hourlyRate),
        firstClientName,
        firstClientEmail,
        firstProjectName,
        firstProjectBudget: Number(firstProjectBudget),
        maxIncludedRevisions: Number(maxIncludedRevisions),
      });

      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Onboarding failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-xl p-8 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold font-mono">
              OS
            </div>
            <span className="text-xs font-semibold tracking-tight text-foreground">FreelancerOS Setup</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
        </div>

        {/* Step 1: Specialty */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">What is your creative specialty?</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                We will tailor revision tracking, deliverable types, and unit economics to your craft.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2">
              {FREELANCER_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFreelancerType(type.id)}
                  className={`p-3 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between ${
                    freelancerType === type.id
                      ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 text-foreground'
                      : 'border-border hover:bg-neutral-50 dark:hover:bg-neutral-900 text-muted-foreground'
                  }`}
                >
                  <span>{type.label}</span>
                  {freelancerType === type.id && <Check className="w-3.5 h-3.5 text-foreground" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Workspace & Currency */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Name your studio workspace</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                This appears on your client proposals, quotes, and PDF invoices.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Studio / Workspace Name *
                </label>
                <input
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Primary Currency *
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Rates */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Set your baseline hourly rate</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                FreelancerOS uses this to compute project profitability and effective rate returns.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Target Hourly Rate ({currency === 'INR' ? '₹' : '$'}) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                />
              </div>

              <div className="p-3 rounded bg-neutral-100 dark:bg-neutral-900 border border-border text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Effective Hourly Rate Formula:</span>
                <p className="mt-0.5">
                  Even on fixed-fee contracts, you will always see: (Project Revenue – Direct Costs) ÷ Tracked Hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: First Client */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Add your first active client</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Start tracking projects, deliverables, and invoices right away.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Client / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstClientName}
                  onChange={(e) => setFirstClientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Primary Client Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={firstClientEmail}
                  onChange={(e) => setFirstClientEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: First Project & Revision Scope */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Configure your first project</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set contract budget and lock in revision limits to prevent scope creep.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={firstProjectName}
                  onChange={(e) => setFirstProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Project Budget ({currency === 'INR' ? '₹' : '$'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={firstProjectBudget}
                    onChange={(e) => setFirstProjectBudget(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Agreed Free Revisions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={maxIncludedRevisions}
                    onChange={(e) => setMaxIncludedRevisions(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Configuring Studio...' : 'Launch FreelancerOS'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
