import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ModelUsageBreakdown } from '../../types';

interface ModelDistributionChartProps {
  data: ModelUsageBreakdown[];
}

const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e'];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-xl">
      <p className="mb-1 text-xs font-semibold text-text-primary">{d.model}</p>
      <p className="text-xs text-text-secondary">Sessions: {d.sessions.toLocaleString()}</p>
      <p className="text-xs text-text-secondary">Tokens: {d.tokens.toLocaleString()}</p>
      <p className="text-xs text-text-secondary">Cost: ${d.cost.toFixed(2)}</p>
    </div>
  );
}

export default function ModelDistributionChart({ data }: ModelDistributionChartProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">Model Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="sessions"
            nameKey="model"
            paddingAngle={3}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => <span className="text-xs text-text-secondary">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
