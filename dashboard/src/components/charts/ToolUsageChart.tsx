import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { ToolUsageBreakdown } from '../../types';

interface ToolUsageChartProps {
  data: ToolUsageBreakdown[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ToolUsageBreakdown;
  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-xl">
      <p className="mb-1 text-xs font-semibold text-text-primary">{d.toolName}</p>
      <p className="text-xs text-text-secondary">Calls: {d.count.toLocaleString()}</p>
      <p className="text-xs text-text-secondary">Avg Duration: {d.avgDurationMs.toLocaleString()}ms</p>
      <p className="text-xs text-text-secondary">Success Rate: {(d.successRate * 100).toFixed(1)}%</p>
    </div>
  );
}

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#06b6d4', '#22d3ee', '#10b981', '#34d399', '#f59e0b', '#fbbf24', '#f43f5e'];

export default function ToolUsageChart({ data }: ToolUsageChartProps) {
  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">Tool Usage</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sorted} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" opacity={0.5} horizontal={false} />
          <XAxis type="number" stroke="#55556a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="toolName"
            stroke="#55556a"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1a1a25' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
            {sorted.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
