import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

// Renders a responsive donut chart with an accessible text legend.
export default function DonutChart({ data = [], size = 200, thickness = 38, centerLabel = 'Total', showPercentages = false }) {
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0);
  const palette = useMemo(() => ['#16a34a', '#f97316', '#eab308', '#0d9488', '#2563eb', '#7c3aed', '#e11d48', '#65a30d', '#c026d3'], []);
  const radius = Math.max((size - thickness) / 2, 1);

  if (!data.length || !total) {
    return <div className="flex items-center justify-center text-sm text-gray-400" style={{ height: size }}>No data</div>;
  }

  return (
    <div className="flex min-h-[220px] flex-wrap items-center justify-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Sales breakdown, ${total.toLocaleString()} total`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={radius - thickness} outerRadius={radius} paddingAngle={2} stroke="white" strokeWidth={2} isAnimationActive>
              {data.map((entry, index) => <Cell key={`${entry.label}-${index}`} fill={palette[index % palette.length]} />)}
            </Pie>
            <Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Total']} contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(15, 23, 42, .12)' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-gray-500">{centerLabel}</span>
          <span className="text-lg font-bold text-gray-800">{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="min-w-[140px] flex-1 space-y-2">
        {data.map((d, i) => (
          <div
            key={`${d.label}-${i}`}
            className="flex items-center gap-2 text-sm"
          >
            <span className="h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-white shadow-sm" style={{ background: palette[i % palette.length] }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-gray-700">{d.label}</span>
            <span className="text-right font-semibold text-gray-800">
              {Number(d.value).toLocaleString()}
              {showPercentages && <span className="ml-1 text-xs font-normal text-gray-500">({((Number(d.value) / total) * 100).toFixed(0)}%)</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}