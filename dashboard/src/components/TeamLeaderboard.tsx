import { useState } from 'react';
import type { TeamSummary } from '../types';
import { Trophy } from 'lucide-react';
import clsx from 'clsx';

interface TeamLeaderboardProps {
  teams: TeamSummary[];
}

type Metric = 'cost_efficiency' | 'productivity' | 'adoption';

const METRICS: { value: Metric; label: string }[] = [
  { value: 'cost_efficiency', label: 'Cost Efficiency' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'adoption', label: 'Adoption' },
];

function getMetricValue(team: TeamSummary, metric: Metric): number {
  switch (metric) {
    case 'cost_efficiency':
      return team.totalLinesChanged > 0 ? team.totalLinesChanged / team.totalCost : 0;
    case 'productivity':
      return team.memberCount > 0 ? team.totalCommits / team.memberCount : 0;
    case 'adoption':
      return team.memberCount > 0 ? team.totalSessions / team.memberCount : 0;
  }
}

function formatMetricValue(value: number, metric: Metric): string {
  switch (metric) {
    case 'cost_efficiency': return `${value.toFixed(0)} lines/$`;
    case 'productivity': return `${value.toFixed(1)} commits/member`;
    case 'adoption': return `${value.toFixed(0)} sessions/member`;
  }
}

const MEDAL_COLORS = ['text-amber', 'text-text-secondary', 'text-amber/60'];

export default function TeamLeaderboard({ teams }: TeamLeaderboardProps) {
  const [metric, setMetric] = useState<Metric>('productivity');

  const ranked = [...teams]
    .map((t) => ({ ...t, metricValue: getMetricValue(t, metric) }))
    .sort((a, b) => b.metricValue - a.metricValue);

  const maxVal = ranked[0]?.metricValue || 1;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Trophy size={16} className="text-amber" />
          Team Leaderboard
        </h3>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as Metric)}
          className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-text-primary outline-none"
        >
          {METRICS.map((m) => (
            <option key={m.value} value={m.value} className="bg-surface">{m.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {ranked.map((team, i) => (
          <div key={team.teamId} className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={clsx('text-sm font-bold', i < 3 ? MEDAL_COLORS[i] : 'text-text-muted')}>
                  #{i + 1}
                </span>
                <span className="text-sm font-medium text-text-primary">{team.teamName}</span>
                <span className="text-xs text-text-muted">({team.memberCount} members)</span>
              </div>
              <span className="text-xs font-mono text-accent">{formatMetricValue(team.metricValue, metric)}</span>
            </div>
            <div className="h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${(team.metricValue / maxVal) * 100}%` }}
              />
            </div>
            <div className="mt-2 flex gap-4 text-xs text-text-muted">
              <span>Sessions: {team.totalSessions.toLocaleString()}</span>
              <span>Cost: ${team.totalCost.toFixed(0)}</span>
              <span>Lines: {team.totalLinesChanged.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
