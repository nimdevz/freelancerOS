'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate } from '@freelanceros/ui';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderKanban,
  Flag,
  PackageCheck,
  FileCheck2,
  Video,
  Filter,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

type CalendarEventType = 'deadline' | 'milestone' | 'deliverable' | 'invoice' | 'shoot';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: CalendarEventType;
  status?: string;
  projectName?: string;
  link: string;
  amount?: number;
  time?: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 1)); // October 2026 default based on studio timeline
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string | null>('2026-10-06');

  // Fetch projects, milestones, deliverables, invoices, call sheets
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones'],
    queryFn: () => api.milestones.list(),
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ['deliverables'],
    queryFn: () => api.deliverables.list(),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.invoices.list(),
  });

  const { data: callSheets = [] } = useQuery({
    queryKey: ['callSheets'],
    queryFn: () => api.creative.callSheets.list(),
  });

  // Aggregate all calendar events
  const allEvents = useMemo<CalendarEvent[]>(() => {
    const list: CalendarEvent[] = [];

    // 1. Project Deadlines
    projects.forEach((p) => {
      if (p.deadline) {
        list.push({
          id: `prj-${p.id}`,
          title: `Project Deadline: ${p.name}`,
          date: p.deadline,
          type: 'deadline',
          status: p.status,
          projectName: p.name,
          link: `/projects/${p.id}`,
        });
      }
    });

    // 2. Milestones
    milestones.forEach((m) => {
      if (m.dueDate) {
        const proj = projects.find((p) => p.id === m.projectId);
        list.push({
          id: `mil-${m.id}`,
          title: `Milestone: ${m.name}`,
          date: m.dueDate,
          type: 'milestone',
          status: m.status,
          projectName: proj?.name,
          link: `/projects/${m.projectId}`,
          amount: m.paymentAmount || undefined,
        });
      }
    });

    // 3. Deliverables
    deliverables.forEach((d) => {
      const dateStr = d.createdAt?.split('T')[0] || '2026-10-02';
      list.push({
        id: `del-${d.id}`,
        title: `Deliverable: ${d.title} (${d.currentVersion})`,
        date: dateStr,
        type: 'deliverable',
        status: d.status,
        projectName: d.projectName,
        link: `/deliverables`,
      });
    });

    // 4. Invoices Due
    invoices.forEach((i) => {
      if (i.dueDate) {
        list.push({
          id: `inv-${i.id}`,
          title: `Invoice Due: ${i.invoiceNumber}`,
          date: i.dueDate,
          type: 'invoice',
          status: i.status,
          projectName: i.title,
          link: `/invoices`,
          amount: i.balanceDue,
        });
      }
    });

    // 5. Production Shoots
    callSheets.forEach((cs) => {
      if (cs.shootDate) {
        const proj = projects.find((p) => p.id === cs.projectId);
        list.push({
          id: `cs-${cs.id}`,
          title: `Shoot: ${cs.title}`,
          date: cs.shootDate,
          type: 'shoot',
          projectName: proj?.name,
          link: `/projects/${cs.projectId}`,
          time: cs.callTimes?.split('|')[0] || undefined,
        });
      }
    });

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [projects, milestones, deliverables, invoices, callSheets]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (selectedType === 'all') return allEvents;
    return allEvents.filter((e) => e.type === selectedType);
  }, [allEvents, selectedType]);

  // Month Grid Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; events: CalendarEvent[] }[] = [];

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter((e) => e.date === dateStr);
      days.push({ dateStr, dayNum, isCurrentMonth: false, events: dayEvents });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter((e) => e.date === dateStr);
      days.push({ dateStr, dayNum, isCurrentMonth: true, events: dayEvents });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter((e) => e.date === dateStr);
      days.push({ dateStr, dayNum, isCurrentMonth: false, events: dayEvents });
    }

    return days;
  }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth, filteredEvents]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return filteredEvents.filter((e) => e.date === selectedDay);
  }, [selectedDay, filteredEvents]);

  const getTypeBadge = (type: CalendarEventType) => {
    switch (type) {
      case 'deadline':
        return { label: 'Deadline', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' };
      case 'milestone':
        return { label: 'Milestone', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' };
      case 'deliverable':
        return { label: 'Deliverable', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', dot: 'bg-indigo-500' };
      case 'invoice':
        return { label: 'Invoice', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' };
      case 'shoot':
        return { label: 'Production', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', dot: 'bg-purple-500' };
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              Calendar & Schedule
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aggregated project deadlines, milestone schedules, review handoffs, and production shoot dates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-lg border border-border bg-muted/40 text-xs">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'month' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'agenda' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Agenda
              </button>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-card">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-medium hover:bg-muted rounded-md text-foreground transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: 'all', label: `All Events (${allEvents.length})` },
            { id: 'deadline', label: 'Deadlines' },
            { id: 'milestone', label: 'Milestones' },
            { id: 'deliverable', label: 'Deliverables' },
            { id: 'invoice', label: 'Invoices' },
            { id: 'shoot', label: 'Shoots' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedType(pill.id)}
              className={`px-3 py-1 rounded-full border transition-colors whitespace-nowrap ${
                selectedType === pill.id
                  ? 'bg-foreground text-background border-foreground font-semibold'
                  : 'bg-card text-muted-foreground border-border hover:border-foreground/30'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Main Calendar Section */}
        {viewMode === 'month' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 7-column Calendar Grid (3 columns on lg) */}
            <div className="lg:col-span-3 border border-border rounded-xl bg-card overflow-hidden shadow-xs">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/20">
                <span className="font-semibold text-sm text-foreground">
                  {monthNames[month]} {year}
                </span>
                <span className="text-xs text-muted-foreground">
                  {filteredEvents.length} event(s) in timeline
                </span>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center text-[11px] font-medium text-muted-foreground py-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border">
                {calendarDays.map((day, idx) => {
                  const isSelected = selectedDay === day.dateStr;
                  const isToday = day.dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDay(day.dateStr)}
                      className={`min-h-[96px] p-1.5 transition-colors cursor-pointer relative flex flex-col justify-between ${
                        !day.isCurrentMonth
                          ? 'bg-muted/10 text-muted-foreground/40'
                          : 'bg-card hover:bg-muted/20 text-foreground'
                      } ${isSelected ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-500/5' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-mono font-medium rounded-full w-5 h-5 flex items-center justify-center ${
                            isToday
                              ? 'bg-indigo-600 text-white font-bold'
                              : isSelected
                              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                              : 'text-foreground'
                          }`}
                        >
                          {day.dayNum}
                        </span>
                        {day.events.length > 0 && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {day.events.length}
                          </span>
                        )}
                      </div>

                      {/* Event chips */}
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {day.events.slice(0, 2).map((ev) => {
                          const badge = getTypeBadge(ev.type);
                          return (
                            <div
                              key={ev.id}
                              className={`truncate text-[10px] px-1.5 py-0.5 rounded border font-medium ${badge.bg}`}
                              title={ev.title}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                        {day.events.length > 2 && (
                          <div className="text-[9px] text-muted-foreground font-medium pl-1">
                            +{day.events.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day Inspection Drawer / Side Card */}
            <div className="border border-border rounded-xl bg-card p-4 space-y-4 shadow-xs h-fit">
              <div>
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  {selectedDay ? formatDate(selectedDay) : 'Select a date'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedDayEvents.length} event(s) scheduled for this date
                </p>
              </div>

              {selectedDayEvents.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-border rounded-lg bg-muted/10">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No events on this date.</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-1">
                    Select another day with scheduled items.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedDayEvents.map((ev) => {
                    const badge = getTypeBadge(ev.type);
                    return (
                      <div
                        key={ev.id}
                        className="p-3 rounded-lg border border-border bg-muted/10 hover:bg-muted/20 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          {ev.amount !== undefined && (
                            <span className="text-xs font-mono font-medium text-foreground">
                              ${ev.amount.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-semibold text-foreground leading-snug">
                          {ev.title}
                        </h4>

                        {ev.projectName && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            Project: {ev.projectName}
                          </p>
                        )}

                        <div className="pt-1 flex justify-end">
                          <Link
                            href={ev.link}
                            className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            View Details <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Agenda / List View */
          <div className="border border-border rounded-xl bg-card divide-y divide-border overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-muted/20 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Full Studio Agenda
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {filteredEvents.length} total entries
              </span>
            </div>

            {filteredEvents.map((ev) => {
              const badge = getTypeBadge(ev.type);
              return (
                <div
                  key={ev.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-20 shrink-0 text-left">
                      <span className="text-xs font-mono font-semibold text-foreground">
                        {formatDate(ev.date)}
                      </span>
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <h4 className="text-xs font-semibold text-foreground truncate">
                          {ev.title}
                        </h4>
                      </div>
                      {ev.projectName && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          Project: {ev.projectName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    {ev.amount !== undefined && (
                      <span className="text-xs font-mono font-semibold text-foreground">
                        ${ev.amount.toLocaleString()}
                      </span>
                    )}
                    <Link
                      href={ev.link}
                      className="px-3 py-1 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1"
                    >
                      Open <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
