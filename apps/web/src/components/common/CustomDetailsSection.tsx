'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

export interface CustomFieldItem {
  key: string;
  value: string;
}

interface CustomDetailsSectionProps {
  fields: CustomFieldItem[];
  onChange: (fields: CustomFieldItem[]) => void;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  notesPlaceholder?: string;
  title?: string;
  buttonLabel?: string;
  defaultOpen?: boolean;
}

export function formatCustomDetailsSummary(fields: CustomFieldItem[], notes?: string): string {
  const parts: string[] = [];
  const validFields = fields.filter((f) => f.key.trim() && f.value.trim());

  if (validFields.length > 0) {
    parts.push('Custom Details:');
    validFields.forEach((f) => {
      parts.push(`• ${f.key.trim()}: ${f.value.trim()}`);
    });
  }

  if (notes && notes.trim()) {
    if (parts.length > 0) parts.push('');
    parts.push(`Notes: ${notes.trim()}`);
  }

  return parts.join('\n');
}

export function CustomDetailsSection({
  fields,
  onChange,
  notes,
  onNotesChange,
  notesPlaceholder = 'Add any additional custom specifications, deliverables criteria, or client notes...',
  title = 'Custom Details & Specifications',
  buttonLabel = '+ Add Custom Detail',
  defaultOpen = false,
}: CustomDetailsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || fields.length > 0 || Boolean(notes));

  const handleAddField = () => {
    onChange([...fields, { key: '', value: '' }]);
    if (!isOpen) setIsOpen(true);
  };

  const handleUpdateField = (index: number, key: string, value: string) => {
    const updated = [...fields];
    updated[index] = { key, value };
    onChange(updated);
  };

  const handleRemoveField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    onChange(updated);
  };

  if (!isOpen && fields.length === 0 && !notes) {
    return (
      <div className="pt-1">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            if (fields.length === 0) {
              onChange([{ key: '', value: '' }]);
            }
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 border border-dashed border-border rounded-md transition-colors"
        >
          <Sliders className="w-3 h-3 text-muted-foreground" />
          <span>{buttonLabel}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="border border-border/70 rounded-lg p-3 bg-card/40 space-y-3 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{title}</span>
          {fields.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-mono bg-muted text-muted-foreground rounded">
              {fields.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddField}
            className="text-[11px] font-medium text-foreground hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Field</span>
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
          >
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-3 pt-1">
          {fields.map((field, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Field name (e.g. Aspect Ratio)"
                value={field.key}
                onChange={(e) => handleUpdateField(idx, e.target.value, field.value)}
                className="w-1/3 px-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
              <input
                type="text"
                placeholder="Value (e.g. 16:9 4K UHD)"
                value={field.value}
                onChange={(e) => handleUpdateField(idx, field.key, e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
              <button
                type="button"
                onClick={() => handleRemoveField(idx)}
                className="p-1 text-muted-foreground hover:text-red-500 rounded transition-colors"
                title="Remove field"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {onNotesChange && (
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Custom Specifications & Notes
              </label>
              <textarea
                rows={2}
                value={notes || ''}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder={notesPlaceholder}
                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-y leading-relaxed"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
