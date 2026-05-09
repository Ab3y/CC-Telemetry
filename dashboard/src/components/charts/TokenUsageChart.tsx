import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { TimeRange } from '../../types';

interface TokenUsageChartProps {
  data: { timestamp: string; input: number; output: number; cacheRead: number; cacheCreation: number }[];
  timeRange: TimeRange;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-text-secondary">
        {format(parseISO(label), 'MMM d, HH:mm')}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="font-mono font-medium text-text-primary">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function TokenUsageChart({ data, timeRange }: TokenUsageChartProps) {
  const fmt = timeRange === '1h' || timeRange === '6h' ? 'HH:mm' : timeRange === '24h' ? 'HH:mm' : 'MMM d';
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">Token Usage Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="inputGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="outputGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cacheReadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cacheCreateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" opacity={0.5} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(v) => format(parseISO(v), fmt)}
            stroke="#55556a"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#55556a"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: '#8888a0' }}
          />
          <Area type="monotone" dataKey="input" name="Input" stackId="1" stroke="#6366f1" fill="url(#inputGrad)" />
          <Area type="monotone" dataKey="output" name="Output" stackId="1" stroke="#06b6d4" fill="url(#outputGrad)" />
          <Area type="monotone" dataKey="cacheRead" name="Cache Read" stackId="1" stroke="#10b981" fill="url(#cacheReadGrad)" />
          <Area type="monotone" dataKey="cacheCreation" name="Cache Creation" stackId="1" stroke="#f59e0b" fill="url(#cacheCreateGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
