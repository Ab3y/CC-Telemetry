import { useMemo } from 'react';
import type { TimeRange } from '../types';
import StatCard from '../components/StatCard';
import CostTrendChart from '../components/charts/CostTrendChart';
import ModelDistributionChart from '../components/charts/ModelDistributionChart';
import TeamLeaderboard from '../components/TeamLeaderboard';
import { Building2, Users, Activity, Coins, Zap, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  generateOrgSummary,
  generateCostTrends,
  generateModelBreakdown,
} from '../data/mockData';

interface OrgViewProps {
  timeRange: TimeRange;
}

const DAYS_MAP: Record<TimeRange, number> = { '1h': 1, '6h': 1, '24h': 1, '7d': 7, '30d': 30 };
const TEAM_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

export default function OrgView({ timeRange }: OrgViewProps) {
  const days = DAYS_MAP[timeRange];
  const org = useMemo(() => generateOrgSummary(), []);
  const costTrends = useMemo(() => generateCostTrends(days), [days]);
  const modelBreakdown = useMemo(() => generateModelBreakdown(), []);

  const teamComparisonData = org.teams.map((t) => ({
    name: t.teamName,
    sessions: t.totalSessions,
    cost: t.totalCost,
    tokens: Math.round(t.totalTokens / 1000),
  }));

  const costByTeam = org.teams.map((t, i) => ({
    name: t.teamName,
    value: t.totalCost,
    fill: TEAM_COLORS[i % TEAM_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Teams" value={org.teamCount} icon={<Building2 size={18} />} color="#6366f1" />
        <StatCard title="Users" value={org.totalUsers} icon={<Users size={18} />} trend={{ value: 4, label: 'vs prev' }} color="#06b6d4" />
        <StatCard title="Sessions" value={org.totalSessions.toLocaleString()} icon={<Activity size={18} />} trend={{ value: 11, label: 'vs prev' }} color="#10b981" />
        <StatCard title="Total Cost" value={`$${org.totalCost.toFixed(0)}`} icon={<Coins size={18} />} trend={{ value: -5, label: 'vs prev' }} color="#f59e0b" />
        <StatCard title="Total Tokens" value={`${(org.totalTokens / 1_000_000).toFixed(1)}M`} icon={<Zap size={18} />} trend={{ value: 9, label: 'vs prev' }} color="#8b5cf6" />
        <StatCard title="Active Time" value={`${org.activeTimeHours.toFixed(0)}h`} icon={<Clock size={18} />} trend={{ value: 3, label: 'vs prev' }} color="#f43f5e" />
      </div>

      <CostTrendChart data={costTrends} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TeamLeaderboard teams={org.teams} />
        <ModelDistributionChart data={modelBreakdown} />
      </div>

      {/* Team comparison */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Team Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={teamComparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" opacity={0.5} />
            <XAxis dataKey="name" stroke="#55556a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#55556a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#8888a0' }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#8888a0' }} />
            <Bar dataKey="sessions" name="Sessions" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="tokens" name="Tokens (K)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost by team pie */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Cost by Team</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={costByTeam}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              nameKey="name"
              paddingAngle={3}
              stroke="none"
            >
              {costByTeam.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8, fontSize: 12 }}
              formatter={(value: unknown) => [`$${Number(value).toFixed(2)}`, 'Cost']}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => <span className="text-xs text-text-secondary">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
