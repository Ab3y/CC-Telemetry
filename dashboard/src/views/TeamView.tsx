import { useMemo, useState } from 'react';
import type { TimeRange } from '../types';
import StatCard from '../components/StatCard';
import TokenUsageChart from '../components/charts/TokenUsageChart';
import ToolUsageChart from '../components/charts/ToolUsageChart';
import ActiveUsersTable from '../components/ActiveUsersTable';
import { Users, Activity, Zap, Coins, Code2, GitPullRequest } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  generateTeamSummaries,
  generateCostByTokenType,
  generateToolBreakdown,
  generateActiveUsers,
} from '../data/mockData';

interface TeamViewProps {
  timeRange: TimeRange;
}

const HOURS_MAP: Record<TimeRange, number> = { '1h': 1, '6h': 6, '24h': 24, '7d': 168, '30d': 720 };

export default function TeamView({ timeRange }: TeamViewProps) {
  const hours = HOURS_MAP[timeRange];
  const teams = useMemo(() => generateTeamSummaries(), []);
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.teamId ?? '');
  const team = teams.find((t) => t.teamId === selectedTeamId) ?? teams[0];

  const tokenData = useMemo(() => generateCostByTokenType(hours), [hours]);
  const toolBreakdown = useMemo(() => generateToolBreakdown(), []);
  const activeUsers = useMemo(() => generateActiveUsers(), []);

  const memberData = team.members.map((m) => ({
    name: m.userName,
    tokens: Math.round(m.totalTokens / 1000),
    cost: m.totalCost,
  }));

  return (
    <div className="space-y-6">
      {/* Team selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-text-secondary">Team:</label>
        <select
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary outline-none"
        >
          {teams.map((t) => (
            <option key={t.teamId} value={t.teamId} className="bg-surface">{t.teamName}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Members" value={team.memberCount} icon={<Users size={18} />} color="#6366f1" />
        <StatCard title="Sessions" value={team.totalSessions.toLocaleString()} icon={<Activity size={18} />} trend={{ value: 10, label: 'vs prev' }} color="#06b6d4" />
        <StatCard title="Tokens" value={`${(team.totalTokens / 1_000_000).toFixed(1)}M`} icon={<Zap size={18} />} trend={{ value: 6, label: 'vs prev' }} color="#10b981" />
        <StatCard title="Cost" value={`$${team.totalCost.toFixed(0)}`} icon={<Coins size={18} />} trend={{ value: -2, label: 'vs prev' }} color="#f59e0b" />
        <StatCard title="Lines Changed" value={team.totalLinesChanged.toLocaleString()} icon={<Code2 size={18} />} trend={{ value: 18, label: 'vs prev' }} color="#22c55e" />
        <StatCard title="PRs" value={team.totalPRs} icon={<GitPullRequest size={18} />} trend={{ value: 7, label: 'vs prev' }} color="#8b5cf6" />
      </div>

      <TokenUsageChart data={tokenData} timeRange={timeRange} />

      {/* Member comparison */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Member Comparison (Tokens in K / Cost in $)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={memberData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" opacity={0.5} />
            <XAxis dataKey="name" stroke="#55556a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" stroke="#55556a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke="#55556a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#8888a0' }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#8888a0' }} />
            <Bar yAxisId="left" dataKey="tokens" name="Tokens (K)" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="cost" name="Cost ($)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActiveUsersTable data={activeUsers.filter((u) => {
          const teamMembers = team.members.map((m) => m.userId);
          return teamMembers.includes(u.userId);
        }).length > 0 ? activeUsers : activeUsers} />
        <ToolUsageChart data={toolBreakdown} />
      </div>
    </div>
  );
}
