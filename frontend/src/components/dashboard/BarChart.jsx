import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// Renders a responsive bar chart with consistent dashboard styling.
export default function BarChart({ data = [], xKey = 'label', yKey = 'value', height = 260, formatter }) {

  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-400" style={{ height }}>
        No data
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={formatter}
          />
          <Tooltip
            cursor={{ fill: '#f1f5f9', opacity: 0.75 }}
            formatter={(value) => [formatter ? formatter(Number(value)) : Number(value).toLocaleString(), 'Total']}
            contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(15, 23, 42, .12)' }}
          />
          <Bar dataKey={yKey} fill="#16a34a" radius={[6, 6, 0, 0]} maxBarSize={46} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
