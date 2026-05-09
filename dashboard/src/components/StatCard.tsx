import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
}

export default function StatCard({ title, value, subtitle, icon, trend, color = '#6366f1' }: StatCardProps) {
  return (
    <div
      className="relative rounded-xl border border-border bg-surface p-5 transition-colors hover:bg-surface-hover overflow-hidden"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">{title}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary truncate">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
          {trend && (
            <div className={clsx('mt-2 flex items-center gap-1 text-xs font-medium', trend.value >= 0 ? 'text-success' : 'text-danger')}>
              {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{trend.value >= 0 ? '+' : ''}{trend.value}%</span>
              <span className="text-text-muted">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 rounded-lg p-2" style={{ backgroundColor: color + '20', color }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
