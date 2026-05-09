import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface ProductivityDataPoint {
  date: string;
  linesAdded: number;
  linesRemoved: number;
  commits: number;
}

interface ProductivityChartProps {
  data: ProductivityDataPoint[];
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
          <span className="font-mono font-medium text-text-primary">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function generateProductivityData(days: number): ProductivityDataPoint[] {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    return {
      date: d.toISOString().split('T')[0],
      linesAdded: isWeekend ? Math.floor(Math.random() * 200) : Math.floor(Math.random() * 1500 + 200),
      linesRemoved: isWeekend ? Math.floor(Math.random() * 80) : Math.floor(Math.random() * 600 + 50),
      commits: isWeekend ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 15 + 2),
    };
  });
}

export default function ProductivityChart({ data }: ProductivityChartProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">Productivity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" opacity={0.5} />
          <XAxis dataKey="date" stroke="#55556a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" stroke="#55556a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" stroke="#55556a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#8888a0' }} />
          <Bar yAxisId="left" dataKey="linesAdded" name="Lines Added" fill="#22c55e" radius={[4, 4, 0, 0]} opacity={0.8} />
          <Bar yAxisId="left" dataKey="linesRemoved" name="Lines Removed" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
          <Line yAxisId="right" type="monotone" dataKey="commits" name="Commits" stroke="#06b6d4" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
