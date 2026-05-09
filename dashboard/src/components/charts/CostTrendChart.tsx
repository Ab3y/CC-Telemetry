import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { CostTrend } from '../../types';

interface CostTrendChartProps {
  data: CostTrend[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-text-secondary">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="font-mono font-medium text-text-primary">
            {p.dataKey === 'cost' || p.dataKey === 'cumCost' ? `$${p.value.toFixed(2)}` : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CostTrendChart({ data }: CostTrendChartProps) {
  let cum = 0;
  const enriched = data.map((d) => {
    cum += d.cost;
    return { ...d, cumCost: parseFloat(cum.toFixed(2)) };
  });

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">Cost Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={enriched}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" opacity={0.5} />
          <XAxis dataKey="date" stroke="#55556a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" stroke="#55556a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <YAxis yAxisId="right" orientation="right" stroke="#55556a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#8888a0' }} />
          <Bar yAxisId="left" dataKey="cost" name="Daily Cost" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.8} />
          <Line yAxisId="right" type="monotone" dataKey="cumCost" name="Cumulative" stroke="#06b6d4" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
