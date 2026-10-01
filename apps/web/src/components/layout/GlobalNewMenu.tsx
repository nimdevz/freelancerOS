'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore, QuickCreateType } from '@/lib/store';
import {
  Users,
  Target,
  FolderKanban,
  CheckSquare,
  FileText,
  ReceiptText,
  FileCheck2,
  Receipt,
  Timer,
  PackageCheck,
  Plus,
  X,
  CornerDownLeft,
} from 'lucide-react';

interface MenuOption {
  type: NonNullable<QuickCreateType>;
  label: string;
  category: 'Clients' | 'Work' | 'Money' | 'Sales';
  description: string;
  icon: React.ElementType;
  shortcut: string;
}

const MENU_OPTIONS: MenuOption[] = [
  {
    type: 'client',
    label: 'Client',
    category: 'Clients',
    description: 'Add a new client account and business relationship',
    icon: Users,
    shortcut: 'C',
  },
  {
    type: 'lead',
    label: 'Lead',
    category: 'Clients',
    description: 'Track incoming inquiry in the sales pipeline',
    icon: Target,
    shortcut: 'L',
  },
  {
    type: 'project',
    label: 'Project',
    category: 'Work',
    description: 'Start a new client project workspace',
    icon: FolderKanban,
    shortcut: 'P',
  },
  {
    type: 'task',
    label: 'Task',
    category: 'Work',
    description: 'Create an actionable task item for a project',
    icon: CheckSquare,
    shortcut: 'T',
  },
  {
    type: 'deliverable',
    label: 'Deliverable',
    category: 'Work',
    description: 'Add master cut, design file, or asset for review',
    icon: PackageCheck,
    shortcut: 'D',
  },
  {
    type: 'invoice',
    label: 'Invoice',
    category: 'Money',
    description: 'Issue milestone or deposit invoice to a client',
    icon: FileCheck2,
    shortcut: 'I',
  },
  {
    type: 'expense',
    label: 'Expense',
    category: 'Money',
    description: 'Log project expense, software license, or gear rental',
    icon: Receipt,
    shortcut: 'E',
  },
  {
    type: 'time',
    label: 'Time Entry',
    category: 'Work',
    description: 'Log focus hours and billable production time',
    icon: Timer,
    shortcut: 'M',
  },
  {
    type: 'proposal',
    label: 'Proposal',
    category: 'Sales',
    description: 'Draft scope of work, timeline, and pricing pitch',
    icon: FileText,
    shortcut: 'R',
  },
  {
    type: 'quote',
    label: 'Quote',
    category: 'Sales',
    description: 'Send quick estimate before full proposal',
    icon: ReceiptText,
    shortcut: 'Q',
  },
];

export function GlobalNewMenu() {
  const { isNewMenuOpen, setNewMenuOpen, openQuickCreate } = useAppStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredOptions = MENU_OPTIONS.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      opt.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      opt.category.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  // Keyboard navigation & global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle menu with 'n' or 'N' if not typing in an input
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (!isInput && (e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setNewMenuOpen(!isNewMenuOpen);
        return;
      }

      if (!isNewMenuOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setNewMenuOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredOptions.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filteredOptions.length || 1)) % (filteredOptions.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredOptions[selectedIndex]) {
          handleSelect(filteredOptions[selectedIndex].type);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNewMenuOpen, selectedIndex, filteredOptions]);

  const handleSelect = (type: QuickCreateType) => {
    setNewMenuOpen(false);
    setSearchFilter('');
    openQuickCreate(type);
  };

  if (!isNewMenuOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setNewMenuOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 bg-black/40 backdrop-blur-sm animate-in fade-in duration-100"
    >
      <div
        ref={menuRef}
        className="w-full max-w-md bg-card rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-100"
      >
        {/* Header Search */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 flex-1">
            <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Create new item... (type or use arrows)"
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setSelectedIndex(0);
              }}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            onClick={() => setNewMenuOpen(false)}
            className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Option List */}
        <div className="overflow-y-auto p-1.5 space-y-0.5 divide-y-0 max-h-[420px]">
          {filteredOptions.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching creation action found.
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const Icon = opt.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={opt.type}
                  onClick={() => handleSelect(opt.type)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-background border-border text-foreground shadow-xs'
                          : 'bg-muted/40 border-border/60 text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground leading-tight">
                          {opt.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-muted text-muted-foreground">
                          {opt.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {opt.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {isSelected && (
                      <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                        <CornerDownLeft className="w-2.5 h-2.5" />
                      </kbd>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-3 py-2 border-t border-border bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="font-mono">Use ↑↓ arrows to navigate</span>
          <span className="font-mono">ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
}
