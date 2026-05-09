import { useMemo } from 'react';
import type { TimeRange } from '../types';
import StatCard from '../components/StatCard';
import TokenUsageChart from '../components/charts/TokenUsageChart';
import CostTrendChart from '../components/charts/CostTrendChart';
import ModelDistributionChart from '../components/charts/ModelDistributionChart';
import ToolUsageChart from '../components/charts/ToolUsageChart';
import ProductivityChart, { generateProductivityData } from '../components/charts/ProductivityChart';
import SessionsTable from '../components/SessionsTable';
import { Activity, Coins, Code2, GitCommit, Clock, Zap } from 'lucide-react';
import {
  generateMockSessions,
  generateCostTrends,
  generateCostByTokenType,
  generateModelBreakdown,
  generateToolBreakdown,
} from '../data/mockData';

interface IndividualViewProps {
  timeRange: TimeRange;
}

const HOURS_MAP: Record<TimeRange, number> = { '1h': 1, '6h': 6, '24h': 24, '7d': 168, '30d': 720 };
const DAYS_MAP: Record<TimeRange, number> = { '1h': 1, '6h': 1, '24h': 1, '7d': 7, '30d': 30 };

export default function IndividualView({ timeRange }: IndividualViewProps) {
  const hours = HOURS_MAP[timeRange];
  const days = DAYS_MAP[timeRange];

  const sessions = useMemo(() => generateMockSessions(50), []);
  const tokenData = useMemo(() => generateCostByTokenType(hours), [hours]);
  const costTrends = useMemo(() => generateCostTrends(days), [days]);
  const modelBreakdown = useMemo(() => generateModelBreakdown(), []);
  const toolBreakdown = useMemo(() => generateToolBreakdown(), []);
  const prodData = useMemo(() => generateProductivityData(days), [days]);

  const totalTokens = sessions.reduce((s, x) => s + x.tokens.input + x.tokens.output, 0);
  const totalCost = sessions.reduce((s, x) => s + x.costUsd, 0);
  const totalLines = sessions.reduce((s, x) => s + x.linesAdded + x.linesRemoved, 0);
  const totalCommits = sessions.reduce((s, x) => s + x.commits, 0);
  const totalActiveTime = sessions.reduce((s, x) => s + x.activeTimeCli, 0) / 3600;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Sessions" value={sessions.length} icon={<Activity size={18} />} trend={{ value: 12, label: 'vs prev' }} color="#6366f1" />
        <StatCard title="Tokens Used" value={`${(totalTokens / 1000).toFixed(0)}k`} icon={<Zap size={18} />} trend={{ value: 8, label: 'vs prev' }} color="#06b6d4" />
        <StatCard title="Cost" value={`$${totalCost.toFixed(2)}`} icon={<Coins size={18} />} trend={{ value: -3, label: 'vs prev' }} color="#f59e0b" />
        <StatCard title="Lines Changed" value={totalLines.toLocaleString()} icon={<Code2 size={18} />} trend={{ value: 15, label: 'vs prev' }} color="#22c55e" />
        <StatCard title="Commits" value={totalCommits} icon={<GitCommit size={18} />} trend={{ value: 5, label: 'vs prev' }} color="#8b5cf6" />
        <StatCard title="Active Time" value={`${totalActiveTime.toFixed(1)}h`} icon={<Clock size={18} />} trend={{ value: 2, label: 'vs prev' }} color="#f43f5e" />
      </div>

      <TokenUsageChart data={tokenData} timeRange={timeRange} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CostTrendChart data={costTrends} />
        <ModelDistributionChart data={modelBreakdown} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ToolUsageChart data={toolBreakdown} />
        <ProductivityChart data={prodData} />
      </div>

      <SessionsTable data={sessions} />
    </div>
  );
}
