import { useState, useMemo } from 'react';
import type { TimeRange, ViewLevel } from '../types';
import StatCard from '../components/StatCard';
import TokenUsageChart from '../components/charts/TokenUsageChart';
import ModelDistributionChart from '../components/charts/ModelDistributionChart';
import ToolUsageChart from '../components/charts/ToolUsageChart';
import { Zap, DollarSign, Cpu, Gauge, BarChart3, Clock } from 'lucide-react';
import {
  generateCostByTokenType,
  generateModelBreakdown,
  generateToolBreakdown,
  generateMockSessions,
  TEAM_LIST,
} from '../data/mockData';

interface UsageViewProps {
  timeRange: TimeRange;
  viewLevel: ViewLevel;
}

const HOURS_MAP: Record<TimeRange, number> = { '1h': 1, '6h': 6, '24h': 24, '7d': 168, '30d': 720 };

export default function UsageView({ timeRange, viewLevel }: UsageViewProps) {
  const [selectedTeam, setSelectedTeam] = useState(TEAM_LIST[0]);
  const hours = HOURS_MAP[timeRange];
  const tokenData = useMemo(() => generateCostByTokenType(hours), [hours]);
  const modelBreakdown = useMemo(() => generateModelBreakdown(), []);
  const toolBreakdown = useMemo(() => generateToolBreakdown(), []);
  const allSessions = useMemo(() => generateMockSessions(200), []);

  // Filter sessions by scope
  const sessions = useMemo(() => {
    if (viewLevel === 'individual') return allSessions.filter((s) => s.userName === 'alice.chen');
    if (viewLevel === 'team') return allSessions.filter((s) => s.teamName === selectedTeam);
    return allSessions;
  }, [allSessions, viewLevel, selectedTeam]);

  // Scale token data by scope ratio
  const scopeRatio = allSessions.length > 0 ? sessions.length / allSessions.length : 1;
  const scaledTokenData = useMemo(() => tokenData.map((d) => ({
    ...d,
    input: Math.round(d.input * scopeRatio),
    output: Math.round(d.output * scopeRatio),
    cacheRead: Math.round(d.cacheRead * scopeRatio),
    cacheCreation: Math.round(d.cacheCreation * scopeRatio),
  })), [tokenData, scopeRatio]);

  const totalInput = scaledTokenData.reduce((s, d) => s + d.input, 0);
  const totalOutput = scaledTokenData.reduce((s, d) => s + d.output, 0);
  const totalCacheRead = scaledTokenData.reduce((s, d) => s + d.cacheRead, 0);
  const totalCacheCreation = scaledTokenData.reduce((s, d) => s + d.cacheCreation, 0);
  const totalTokens = totalInput + totalOutput + totalCacheRead + totalCacheCreation;
  const totalCost = sessions.reduce((s, x) => s + x.costUsd, 0);
  const cacheHitRate = totalTokens > 0 ? ((totalCacheRead / totalTokens) * 100) : 0;
  const avgTokensPerSession = sessions.length > 0
    ? Math.round(sessions.reduce((s, x) => s + x.tokens.input + x.tokens.output, 0) / sessions.length)
    : 0;
  const totalToolCalls = sessions.reduce((s, x) => s + x.toolCalls, 0);
  const avgActiveTime = sessions.length > 0
    ? (sessions.reduce((s, x) => s + x.activeTimeCli, 0) / sessions.length / 60)
    : 0;

  const timeLabel = { '1h': 'Last Hour', '6h': 'Last 6 Hours', '24h': 'Last 24 Hours', '7d': 'Last 7 Days', '30d': 'Last 30 Days' }[timeRange];

  // Top models table
  const modelRows = modelBreakdown.map((m) => ({
    model: m.model,
    sessions: m.sessions,
    tokens: m.tokens,
    cost: m.cost,
    avgCostPerSession: m.sessions > 0 ? m.cost / m.sessions : 0,
  })).sort((a, b) => b.cost - a.cost);

  const scopeLabel = viewLevel === 'individual' ? 'Your usage' : viewLevel === 'team' ? selectedTeam : 'Organization-wide';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Usage & Consumption</h2>
          <p className="text-sm text-text-secondary">{scopeLabel} — {timeLabel}</p>
        </div>
        {viewLevel === 'team' && (
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary outline-none"
          >
            {TEAM_LIST.map((t) => (
              <option key={t} value={t} className="bg-surface">{t}</option>
            ))}
          </select>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Tokens" value={`${(totalTokens / 1_000_000).toFixed(1)}M`} icon={<Zap size={18} />} color="#6366f1" />
        <StatCard title="Total Cost" value={`$${totalCost.toFixed(2)}`} icon={<DollarSign size={18} />} color="#f59e0b" />
        <StatCard title="Cache Hit Rate" value={`${cacheHitRate.toFixed(1)}%`} icon={<Gauge size={18} />} color="#10b981" />
        <StatCard title="Avg Tokens/Session" value={avgTokensPerSession.toLocaleString()} icon={<Cpu size={18} />} color="#06b6d4" />
        <StatCard title="Tool Calls" value={totalToolCalls.toLocaleString()} icon={<BarChart3 size={18} />} color="#8b5cf6" />
        <StatCard title="Avg Session" value={`${avgActiveTime.toFixed(0)}m`} icon={<Clock size={18} />} color="#f43f5e" />
      </div>

      {/* Token usage chart */}
      <TokenUsageChart data={scaledTokenData} timeRange={timeRange} />

      {/* Model breakdown table + distribution chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Cost by Model</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Model</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Sessions</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Tokens</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Cost</th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">$/Session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {modelRows.map((r) => (
                  <tr key={r.model} className="transition-colors hover:bg-surface-hover">
                    <td className="px-3 py-2.5 text-sm font-mono text-text-primary">{r.model}</td>
                    <td className="px-3 py-2.5 text-sm text-right text-text-secondary">{r.sessions.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-sm text-right font-mono text-text-secondary">{(r.tokens / 1_000_000).toFixed(1)}M</td>
                    <td className="px-3 py-2.5 text-sm text-right font-mono text-accent">${r.cost.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-sm text-right font-mono text-text-muted">${r.avgCostPerSession.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <ModelDistributionChart data={modelBreakdown} />
      </div>

      {/* Tool usage */}
      <ToolUsageChart data={toolBreakdown} />

      {/* Token type breakdown */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Token Type Breakdown</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Input', value: totalInput, color: '#6366f1' },
            { label: 'Output', value: totalOutput, color: '#06b6d4' },
            { label: 'Cache Read', value: totalCacheRead, color: '#10b981' },
            { label: 'Cache Creation', value: totalCacheCreation, color: '#f59e0b' },
          ].map((t) => (
            <div key={t.label} className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-xs font-medium text-text-secondary">{t.label}</span>
              </div>
              <p className="text-xl font-bold text-text-primary">{(t.value / 1_000_000).toFixed(2)}M</p>
              <p className="text-xs text-text-muted">{totalTokens > 0 ? ((t.value / totalTokens) * 100).toFixed(1) : 0}% of total</p>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-border">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${totalTokens > 0 ? (t.value / totalTokens) * 100 : 0}%`, backgroundColor: t.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
