import React from 'react';
import type { ViewLevel, TimeRange, NavPage } from '../types';
import {
  LayoutDashboard, Users, Building2, Activity, Settings,
  Clock, Zap, Menu, X,
} from 'lucide-react';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  viewLevel: ViewLevel;
  onViewLevelChange: (v: ViewLevel) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (t: TimeRange) => void;
  activePage: NavPage;
  onPageChange: (p: NavPage) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'activity' as const, label: 'Activity', icon: Activity },
  { id: 'usage' as const, label: 'Usage', icon: Zap },
];

const VIEW_LEVELS: { value: ViewLevel; label: string; icon: React.ElementType }[] = [
  { value: 'individual', label: 'Individual', icon: LayoutDashboard },
  { value: 'team', label: 'Team', icon: Users },
  { value: 'organization', label: 'Organization', icon: Building2 },
];

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export default function Layout({ children, viewLevel, onViewLevelChange, timeRange, onTimeRangeChange, activePage, onPageChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <Zap size={20} className="text-accent" />
          <span className="text-sm font-bold text-text-primary">CC Telemetry</span>
          <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">Beta</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} className="text-text-secondary" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { onPageChange(item.id); setSidebarOpen(false); }}
              className={clsx(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                activePage === item.id
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors">
            <Settings size={18} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-surface px-4">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-text-secondary" />
          </button>

          <h1 className="hidden text-sm font-semibold text-text-primary sm:block">Claude Code Telemetry</h1>

          <div className="ml-auto flex items-center gap-3">
            {/* View level pills */}
            <div className="hidden items-center rounded-lg border border-border bg-background p-0.5 sm:flex">
              {VIEW_LEVELS.map((vl) => (
                <button
                  key={vl.value}
                  onClick={() => onViewLevelChange(vl.value)}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    viewLevel === vl.value
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <vl.icon size={14} />
                  {vl.label}
                </button>
              ))}
            </div>

            {/* Time range */}
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1">
              <Clock size={14} className="text-text-muted" />
              <select
                value={timeRange}
                onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
                className="bg-transparent text-xs text-text-primary outline-none cursor-pointer"
              >
                {TIME_RANGES.map((tr) => (
                  <option key={tr.value} value={tr.value} className="bg-surface">
                    {tr.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile view selector */}
            <select
              value={viewLevel}
              onChange={(e) => onViewLevelChange(e.target.value as ViewLevel)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-text-primary outline-none sm:hidden"
            >
              {VIEW_LEVELS.map((vl) => (
                <option key={vl.value} value={vl.value} className="bg-surface">
                  {vl.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
