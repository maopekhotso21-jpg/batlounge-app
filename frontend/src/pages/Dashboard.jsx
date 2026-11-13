// Provides dashboard state and lifecycle behavior.
import { useEffect, useState } from 'react';

import { Boxes, Leaf } from 'lucide-react';
import { Apple, Boxes, CheckCircle2, ClipboardList, Clock3, DollarSign, Leaf, Store, Truck } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard.jsx';
import BarChart from '../components/dashboard/BarChart.jsx';
import DonutChart from '../components/dashboard/DonutChart.jsx';
import Card from '../components/ui/Card.jsx';
import Loader from '../components/ui/Loader.jsx';
import { fruitsAPI, ordersAPI, reportsAPI, stockAPI, vendorsAPI } from '../services/endpoints.js';
import { getError } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

import { useAuth } from '../context/AuthContext.jsx';

const FRUIT_IMAGES = {
  apples: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=700&q=85',
  bananas: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=85',
  oranges: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=700&q=85',
  mangoes: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=700&q=85',
  grapes: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=700&q=85'
};

const FRUIT_EMOJIS = {
  apples: '🍎',
  bananas: '🍌',
  oranges: '🍊',
  mangoes: '🥭',
  grapes: '🍇'
};

const normalizeFruitName = (name) => name.toLowerCase().trim();

import { currency, dateShort } from '../utils/format.js';

import { useAuth } from '../context/AuthContext.jsx';


export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [fruits, setFruits] = useState([]);
  const [fruitQuantities, setFruitQuantities] = useState({});
  const [salesBox, setSalesBox] = useState([]);
  const [salesDate, setSalesDate] = useState([]);
  const [topFruits, setTopFruits] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [fruitResponse, quantityResponse] = await Promise.all([
          fruitsAPI.list({ status: 'Active' }),
          ordersAPI.fruitQuantities()
        ]);
        setFruits(fruitResponse.data);
        setFruitQuantities(Object.fromEntries(
          quantityResponse.data.map((fruit) => [fruit.fruit_id, Number(fruit.boxes_ordered || 0)])
        ));

        if (isAdmin) {
          const dashboard = await reportsAPI.dashboard();
          setStats(dashboard.data);
        } else {
          
          const [vendors, stock, orders] = await Promise.all([
        if (isAdmin) {
          const [a, b, c, d, e] = await Promise.all([
            reportsAPI.dashboard(), reportsAPI.salesByBoxSize(),
            reportsAPI.totalSalesByDate(), reportsAPI.topSellingFruits(),
            reportsAPI.pendingOrders()
          ]);
          setStats(a.data);
          setSalesBox(b.data);
          setSalesDate(c.data);
          setTopFruits(d.data);
          setPending(e.data.slice(0, 5));
        } else {
          
          const [fruits, vendors, stock, orders] = await Promise.all([
            fruitsAPI.list({ status: 'Active' }),
            vendorsAPI.list({ status: 'Active' }),
            stockAPI.list(),
            ordersAPI.list()
          ]);
          const orderRows = orders.data;
          const completed = orderRows.filter((order) => order.status === 'Completed');
          setStats({
            totalFruits: fruitResponse.data.length,
            totalFruits: fruits.data.length,
            totalSuppliers: 'Admin only',
            totalVendors: vendors.data.length,
            availableStock: stock.data.reduce((sum, product) => sum + Number(product.available_stock || 0), 0),
            totalOrders: orderRows.length,
            pendingOrders: orderRows.filter((order) => !['Completed', 'Cancelled'].includes(order.status)).length,
            completedOrders: completed.length,
            salesValue: completed.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
          });
          setPending(orderRows.filter((order) => !['Completed', 'Cancelled'].includes(order.status)).slice(0, 5));
        }
      } catch (err) {
        toast.error(getError(err));
      } finally { setLoading(false); }
    })();
  }, [isAdmin]);

  if (loading || !stats) return <Loader label="Loading dashboard…" />;

  
  const stagger = (i) => ({ animationDelay: `${i * 0.06}s` });

  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-7 lg:space-y-8">
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-lime-500 via-green-600 to-emerald-800 px-5 py-6 text-white shadow-lg sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-yellow-300/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-orange-400/20 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="animate-slide-up">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-lime-50 backdrop-blur">
              <Leaf size={14} /> FRESH PRODUCE · BATLOUNG DISTRIBUTION
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {greeting}, <span className="text-yellow-200">{user?.username}</span> 
            </h1>
            <p className="mt-2 max-w-xl text-sm text-green-50 sm:text-base">
              Your fruit operations at a glance from fresh stock and supplier deliveries to vendor orders and sales.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 self-center sm:self-auto" aria-label={`${Number(stats.availableStock).toLocaleString()} boxes available`}>
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-white/25 bg-white/10 shadow-inner backdrop-blur">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 144 144" aria-hidden="true">
                <circle cx="72" cy="72" r="61" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
                <circle cx="72" cy="72" r="61" fill="none" stroke="#fef08a" strokeWidth="5" strokeLinecap="round" strokeDasharray="383.3" className="fruit-ring-complete" style={{ '--circle-length': '383.3' }} />
              </svg>
              <div className="relative text-center">
                <Boxes className="mx-auto mb-1 text-yellow-200" size={19} aria-hidden="true" />
                <p className="text-2xl font-bold leading-none tabular-nums">{Number(stats.availableStock).toLocaleString()}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-green-100">Boxes available</p>
              </div>
            </div>
            <p className="text-xs font-medium text-green-50">{Number(stats.pendingOrders).toLocaleString()} open orders</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="fruit-showcase-heading" className="space-y-4">
        <div className="flex flex-col gap-1 border-b border-gray-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Fresh from our catalogue</p>
            <h2 id="fruit-showcase-heading" className="text-lg font-bold text-gray-900">Fruits on offer</h2>
          </div>
          <p className="text-sm text-gray-500">Boxes ordered for each fruit, excluding cancelled orders</p>
        </div>
        {fruits.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center text-sm text-gray-500">
            No active fruits are currently available.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {fruits.map((fruit) => {
              const fruitKey = normalizeFruitName(fruit.fruit_name);
              return (
                <article key={fruit.fruit_id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-lime-50 to-emerald-100">
                    <span className="absolute inset-0 grid place-items-center text-5xl" aria-hidden="true">
                      {FRUIT_EMOJIS[fruitKey] || '🍃'}
                    </span>
                    <img
                      src={FRUIT_IMAGES[fruitKey] || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=85'}
                      alt={fruit.fruit_name}
                      loading="lazy"
                      className="relative h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(event) => { event.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <h3 className="mt-3 truncate font-semibold text-gray-900">{fruit.fruit_name}</h3>
                  <div
                    className="mx-auto mt-3 flex h-[4.5rem] w-24 flex-col items-center justify-start bg-gradient-to-b from-emerald-500 to-green-700 pt-2 text-white drop-shadow-sm"
                    style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
                    aria-label={`${(fruitQuantities[fruit.fruit_id] || 0).toLocaleString()} boxes ordered`}
                  >
                    <span className="text-base font-bold leading-tight tabular-nums">{(fruitQuantities[fruit.fruit_id] || 0).toLocaleString()}</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wide">ordered</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4" aria-labelledby="overview-heading">
        <div className="flex flex-col gap-1 border-b border-gray-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">At a glance</p>
            <h2 id="overview-heading" className="text-lg font-bold text-gray-900">Dashboard overview</h2>
          </div>
          <p className="text-sm text-gray-500">Your people, orders, and sales in one place</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          <div className="animate-slide-up" style={stagger(0)}>
            <StatCard title="Active Fruits" value={stats.totalFruits} description="Fruit varieties currently available in the catalogue." icon={<Apple size={22} />} color="green" />
          </div>
          <div className="animate-slide-up" style={stagger(1)}>
            <StatCard title="Suppliers" value={stats.totalSuppliers} description="Suppliers supporting the fresh produce supply chain." icon={<Truck size={22} />} color="orange" />
          </div>
          <div className="animate-slide-up" style={stagger(2)}>
            <StatCard title="Registered Vendors" value={stats.totalVendors} description="Street vendors registered to buy and sell through Batloung." icon={<Store size={22} />} color="pink" />
          </div>
          <div className="animate-slide-up" style={stagger(3)}>
            <StatCard title="Total Orders" value={stats.totalOrders} description="All orders recorded in the system." icon={<ClipboardList size={22} />} color="purple" />
          </div>
          <div className="animate-slide-up xl:row-start-2 xl:col-start-2" style={stagger(4)}>
            <StatCard title="Pending Orders" value={stats.pendingOrders} description="Orders still being prepared, confirmed, or delivered." icon={<Clock3 size={22} />} color="orange" />
          </div>
          <div className="animate-slide-up xl:row-start-2 xl:col-start-3" style={stagger(5)}>
            <StatCard title="Completed Orders" value={stats.completedOrders} description="Orders successfully fulfilled for vendors." icon={<CheckCircle2 size={22} />} color="green" />
          </div>
          <div className="animate-slide-up xl:row-start-2 xl:col-start-4" style={stagger(6)}>
            <StatCard title="Sales Value" value={currency(stats.salesValue)} description="Revenue from completed orders." icon={<DollarSign size={22} />} color="pink" />
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="analytics-heading">
        <div className="flex flex-col gap-1 border-b border-gray-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Trends &amp; insights</p>
            <h2 id="analytics-heading" className="text-lg font-bold text-gray-900">Sales analytics</h2>
          </div>
          <p className="text-sm text-gray-500">See what is selling and how revenue is changing</p>
        </div>
        <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:gap-5">
          <div className="animate-slide-up [&_.card]:h-full" style={{ animationDelay: '0.45s' }}>
            <Card title="📦 Sales by Box Size">
              {isAdmin ? <BarChart data={salesBox} xKey="label" yKey="value" formatter={currency} /> : <p className="text-sm text-gray-500">Admin sales analytics are restricted. Use Orders to manage sales activity.</p>}
            </Card>
          </div>
          <div className="animate-slide-up [&_.card]:h-full" style={{ animationDelay: '0.5s' }}>
            <Card title="🍓 Top Selling Fruits">
              {isAdmin ? <DonutChart data={topFruits} /> : <p className="text-sm text-gray-500">Fruit ranking reports are available to administrators.</p>}
            </Card>
          </div>
          <div className="animate-slide-up lg:col-span-2 [&_.card]:h-full" style={{ animationDelay: '0.55s' }}>
            <Card title="📈 Fruit Sales Over Time">
              {isAdmin ? <BarChart data={salesDate.slice(-10)} xKey="label" yKey="value" formatter={currency} /> : <p className="text-sm text-gray-500">Date-based sales reports are available to administrators.</p>}
            </Card>
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="fulfil-heading">
        <div className="flex flex-col gap-1 border-b border-gray-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Next actions</p>
            <h2 id="fulfil-heading" className="text-lg font-bold text-gray-900">Orders to fulfil</h2>
          </div>
          <p className="text-sm text-gray-500">The latest orders that still need attention</p>
        </div>
        <Card className="border border-gray-100">
          {pending.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">No pending orders. You’re all caught up.</p>
          ) : (
            <ul className="grid gap-x-8 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-y-0">
              {pending.map((o, i) => (
                <li
                  key={o.order_id}
                  className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 text-sm transition-colors first:pt-1 last:border-b-0 hover:bg-emerald-50/50 sm:px-3 sm:odd:border-b sm:even:border-b-0"
                  style={{ animationDelay: `${0.6 + i * 0.05}s` }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ClipboardList size={18} /></span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-800">#{o.order_id} · {o.vendor_name}</p>
                      <p className="mt-1 text-xs text-gray-500">{dateShort(o.order_date)} · {o.status}</p>
                    </div>
                  </div>
                  <p className="shrink-0 font-semibold text-gray-900">{currency(o.total_amount)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
