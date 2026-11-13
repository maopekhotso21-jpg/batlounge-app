import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, DollarSign, PackageCheck, ShoppingCart, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import Loader from '../components/ui/Loader.jsx';
import BarChart from '../components/dashboard/BarChart.jsx';
import DonutChart from '../components/dashboard/DonutChart.jsx';
import Badge from '../components/ui/Badge.jsx';
import { reportsAPI } from '../services/endpoints.js';
import { getError } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { currency, dateShort } from '../utils/format.js';
import { STATUS_COLORS } from '../utils/constants.js';

const aggregateSalesByPeriod = (rows, period) => {
  const totals = new Map();
  rows.forEach((row) => {
    const dateKey = String(row.label || row.date || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
    const date = new Date(`${dateKey}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return;

    const periodDate = period === 'weekly'
      ? new Date(date.getTime() - ((date.getUTCDay() + 6) % 7) * 86400000)
      : period === 'monthly'
        ? new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
        : new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const key = periodDate.toISOString().slice(0, 10);
    totals.set(key, (totals.get(key) || 0) + Number(row.value || 0));
  });

  const keys = [...totals.keys()].sort();
  if (!keys.length) return [];

  const count = period === 'annually' ? 5 : 12;
  const latest = new Date(`${keys[keys.length - 1]}T00:00:00Z`);
  return Array.from({ length: count }, (_, index) => {
    const offset = count - index - 1;
    const date = new Date(latest);
    if (period === 'weekly') date.setUTCDate(date.getUTCDate() - offset * 7);
    if (period === 'monthly') date.setUTCMonth(date.getUTCMonth() - offset);
    if (period === 'annually') date.setUTCFullYear(date.getUTCFullYear() - offset);

    const periodDate = period === 'monthly'
      ? new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
      : period === 'annually'
        ? new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
        : date;
    const key = periodDate.toISOString().slice(0, 10);
    const label = period === 'weekly'
      ? `Week of ${periodDate.toLocaleDateString('en', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`
      : period === 'monthly'
        ? periodDate.toLocaleDateString('en', { month: 'short', year: '2-digit', timeZone: 'UTC' })
        : String(periodDate.getUTCFullYear());

    return { label, value: totals.get(key) || 0 };
  });
};

// Loads and presents administrator-only sales, purchase, and order reports.
export default function Reports() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [salesDate, setSalesDate] = useState([]);
  const [salesBox, setSalesBox] = useState([]);
  const [salesVendor, setSalesVendor] = useState([]);
  const [purchasesProv, setPurchasesProv] = useState([]);
  const [topFruits, setTopFruits] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [a, b, c, d, e, f, g] = await Promise.all([
          reportsAPI.salesByBoxSize(),
          reportsAPI.salesByVendor(),
          reportsAPI.purchasesByProvince(),
          reportsAPI.pendingOrders(),
          reportsAPI.completedOrders(),
          reportsAPI.totalSalesByDate(),
          reportsAPI.topSellingFruits()
        ]);
        setSalesBox(a.data);
        setSalesVendor(b.data);
        setPurchasesProv(c.data);
        setPending(d.data);
        setCompleted(e.data);
        setSalesDate(f.data);
        setTopFruits(g.data);
      } catch (err) { toast.error(getError(err)); }
      finally { setLoading(false); }
    })();
  }, []); // eslint-disable-line

  if (loading) return <Loader label="Loading reports…" />;

  const totalRevenue = salesDate.reduce((sum, row) => sum + Number(row.value || 0), 0);
  const avgOrderValue = completed.length ? totalRevenue / completed.length : 0;
  const totalOrders = pending.length + completed.length;
  const latestDate = salesDate[salesDate.length - 1];
  const weeklySales = aggregateSalesByPeriod(salesDate, 'weekly');
  const monthlySalesChart = aggregateSalesByPeriod(salesDate, 'monthly');
  const annualSales = aggregateSalesByPeriod(salesDate, 'annually');
  const completionRate = totalOrders ? (completed.length / totalOrders) * 100 : 0;
  const topFruit = topFruits[0];
  const topVendor = salesVendor[0];
  
  const monthlySales = salesDate.reduce((months, row) => {
    const dateKey = String(row.label || row.date || '').slice(0, 10);
    const monthKey = dateKey.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(monthKey)) return months;
    const month = months.get(monthKey) || { revenue: 0, orders: 0 };
    month.revenue += Number(row.value || 0);
    month.orders += Number(row.orders || 0);
    months.set(monthKey, month);
    return months;
  }, new Map());
  
  const latestMonthKey = [...monthlySales.keys()].sort().at(-1);
  const latestMonthDate = latestMonthKey ? new Date(`${latestMonthKey}-01T00:00:00`) : null;
  const previousMonthDate = latestMonthDate ? new Date(latestMonthDate.getFullYear(), latestMonthDate.getMonth() - 1, 1) : null;
  const previousMonthKey = previousMonthDate
    ? `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`
    : null;
  const latestMonth = latestMonthKey ? monthlySales.get(latestMonthKey) : null;
  const previousMonth = previousMonthKey ? monthlySales.get(previousMonthKey) : null;
  const monthChange = previousMonth?.revenue
    ? ((latestMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
    : null;
  const monthLabel = (date) => date?.toLocaleDateString('en', { month: 'long', year: 'numeric' }) || 'No sales data';

  const insights = [
    { label: 'Best seller', value: topFruit ? `${topFruit.label} (${topFruit.value} boxes)` : 'No sales yet', tone: 'emerald' },
    { label: 'Top vendor', value: topVendor ? `${topVendor.label} (${currency(topVendor.value)})` : 'No vendor data yet', tone: 'blue' },
    { label: 'Completed rate', value: `${Math.round(completionRate)}%`, tone: 'purple' },
    { label: 'Open workload', value: `${pending.length} pending orders`, tone: 'amber' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500">Operations intelligence from the Batloung distribution system</p>
      </div>

      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200">System overview</p>
            <h2 className="mt-2 text-3xl font-bold">{currency(totalRevenue)}</h2>
            <p className="mt-2 text-sm text-blue-100">Completed sales value tracked across the platform</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left md:text-right">
            <div className="rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200">Orders</p>
              <p className="mt-1 text-xl font-semibold">{totalOrders}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200">Avg order</p>
              <p className="mt-1 text-xl font-semibold">{currency(avgOrderValue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Completed revenue', value: currency(totalRevenue), badge: 'All-time', badgeColor: 'bg-emerald-50 text-emerald-700', icon: DollarSign, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Completed orders', value: completed.length, badge: 'Fulfilled', badgeColor: 'bg-blue-50 text-blue-700', icon: PackageCheck, color: 'bg-blue-100 text-blue-700' },
          { label: 'Pending workload', value: pending.length, badge: pending.length ? 'Action needed' : 'Clear', badgeColor: pending.length ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700', icon: ShoppingCart, color: 'bg-amber-100 text-amber-700' },
          { label: 'Latest sales day', value: latestDate ? dateShort(latestDate.label || latestDate.date) : 'No data', badge: 'Latest recorded', badgeColor: 'bg-violet-50 text-violet-700', icon: TrendingUp, color: 'bg-violet-100 text-violet-700' }
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
              <div className={`rounded-xl p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${stat.badgeColor}`}>
              {stat.badge}
            </span>
          </div>
        ))}
      </div>

      <Card title="Monthly sales trend">
        <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Latest month with sales</p>
            <p className="mt-2 text-sm text-slate-500">{monthLabel(latestMonthDate)}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{currency(latestMonth?.revenue || 0)}</p>
            <p className="mt-1 text-sm text-slate-600">{latestMonth?.orders || 0} completed orders</p>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
            monthChange === null ? 'bg-slate-100 text-slate-600' :
            monthChange >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            {monthChange === null ? <TrendingUp className="h-4 w-4" /> : monthChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {monthChange === null ? 'No prior-month baseline' : `${Math.abs(monthChange).toFixed(1)}% vs previous month`}
          </div>
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Previous calendar month</p>
            <p className="mt-2 text-sm text-slate-500">{monthLabel(previousMonthDate)}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{currency(previousMonth?.revenue || 0)}</p>
            <p className="mt-1 text-sm text-slate-600">{previousMonth ? `${previousMonth.orders} completed orders` : 'No completed sales recorded'}</p>
          </div>
        </div>
      </Card>

      <section aria-label={`Total completed sales ${currency(totalRevenue)}`} className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-7 shadow-sm">
        <div className="sales-ring h-48 w-48 rounded-full">
          <div className="absolute inset-[10px] z-10 rounded-full bg-white shadow-inner" aria-hidden="true" />
          <div className="relative z-20 px-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Total sales</p>
            <p className="mt-1 text-lg font-extrabold leading-tight text-slate-900">{currency(totalRevenue)}</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">{completed.length.toLocaleString()} completed orders</p>
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500">All-time completed sales</p>
      </section>

      <section aria-labelledby="sales-periods-heading" className="space-y-4">
        <div>
          <h2 id="sales-periods-heading" className="text-lg font-bold text-gray-800">Sales by time period</h2>
          <p className="text-sm text-gray-500">Completed sales are grouped into weekly, monthly, and annual totals.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card title="Weekly sales · last 12 weeks">
            <BarChart data={weeklySales} formatter={currency} />
          </Card>
          <Card title="Monthly sales · last 12 months">
            <BarChart data={monthlySalesChart} formatter={currency} />
          </Card>
          <Card title="Annual sales · last 5 years">
            <BarChart data={annualSales} formatter={currency} />
          </Card>
        </div>
      </section>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {insights.map((item) => (
          <div key={item.label} className={`rounded-2xl border p-4 shadow-sm ${
            item.tone === 'emerald' ? 'border-emerald-200 bg-emerald-50' :
            item.tone === 'blue' ? 'border-blue-200 bg-blue-50' :
            item.tone === 'purple' ? 'border-violet-200 bg-violet-50' :
            'border-amber-200 bg-amber-50'
          }`}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Sales by Box Size (completed)"><BarChart data={salesBox} formatter={currency} /></Card>
        <Card title="Top Selling Fruits (boxes)"><DonutChart data={topFruits} centerLabel="Boxes sold" showPercentages /></Card>
        <Card title="Sales by Street Vendor (completed)">
          <BarChart data={salesVendor} formatter={currency} />
        </Card>
        <Card title="Purchases by South African Province"><BarChart data={purchasesProv} /></Card>
        <Card title="Total Sales by Date (completed)">
          <BarChart data={salesDate.slice(-14)} formatter={currency} />
        </Card>
        <Card title="Order Status Overview">
          <DonutChart data={[
            { label: 'Pending', value: pending.length },
            { label: 'Completed', value: completed.length }
          ]} />
        </Card>
      </div>

      <Card title="Operational highlights">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Best fruit</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">{topFruit ? topFruit.label : 'No fruit data'}</p>
            <p className="mt-1 text-slate-600">{topFruit ? `${topFruit.value} boxes sold` : 'No completed sales yet'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top vendor</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">{topVendor ? topVendor.label : 'No vendors yet'}</p>
            <p className="mt-1 text-slate-600">{topVendor ? currency(topVendor.value) : 'No completed sales exist'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fulfilment</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">{Math.round(completionRate)}%</p>
            <p className="mt-1 text-slate-600">{completed.length} completed of {totalOrders} total orders</p>
          </div>
        </div>
      </Card>

      <Card title="Pending Orders">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr><th className="py-2">#</th><th>Vendor</th><th>Date</th><th>Status</th><th className="text-right">Total</th></tr>
            </thead>
            <tbody className="divide-y">
              {pending.map(o => (
                <tr key={o.order_id}>
                  <td className="py-2">{o.order_id}</td>
                  <td className="py-2">{o.vendor_name}</td>
                  <td className="py-2">{dateShort(o.order_date)}</td>
                  <td className="py-2"><Badge className={STATUS_COLORS[o.status]}>{o.status}</Badge></td>
                  <td className="py-2 text-right font-medium">{currency(o.total_amount)}</td>
                </tr>
              ))}
              {pending.length === 0 && <tr><td colSpan="5" className="py-4 text-center text-gray-500">No pending orders</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Completed Orders">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr><th className="py-2">#</th><th>Vendor</th><th>Date</th><th className="text-right">Total</th></tr>
            </thead>
            <tbody className="divide-y">
              {completed.slice(0, 20).map(o => (
                <tr key={o.order_id}>
                  <td className="py-2">{o.order_id}</td>
                  <td className="py-2">{o.vendor_name}</td>
                  <td className="py-2">{dateShort(o.order_date)}</td>
                  <td className="py-2 text-right font-medium">{currency(o.total_amount)}</td>
                </tr>
              ))}
              {completed.length === 0 && <tr><td colSpan="4" className="py-4 text-center text-gray-500">No completed orders</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}