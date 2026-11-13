import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Table from '../components/ui/Table.jsx';
import Button from '../components/ui/Button.jsx';
import Select from '../components/ui/Select.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import Badge from '../components/ui/Badge.jsx';
import { ordersAPI } from '../services/endpoints.js';
import { getError } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { ORDER_STATUSES, STATUS_COLORS } from '../utils/constants.js';
import { currency, dateShort } from '../utils/format.js';

// Lists orders with search/status/date filters and links to order actions.
export default function Orders() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    setLoading(true);
    try { setRows((await ordersAPI.list({ search, status, from, to })).data); }
    catch (e) { toast.error(getError(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [search, status, from, to]); // eslint-disable-line

  const remove = async (r) => {
    if (!confirm(`Delete order #${r.order_id}?`)) return;
    try { await ordersAPI.remove(r.order_id); toast.success('Deleted'); load(); }
    catch (e) { toast.error(getError(e)); }
  };

  const columns = [
    { key: 'order_id', label: '#', className: 'w-16' },
    { key: 'vendor_name', label: 'Vendor' },
    { key: 'business_name', label: 'Business' },
    { key: 'order_date', label: 'Date', render: (r) => dateShort(r.order_date) },
    { key: 'item_count', label: 'Items' },
    { key: 'total_amount', label: 'Total', render: (r) => currency(r.total_amount) },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge className={STATUS_COLORS[r.status] || 'bg-gray-200'}>{r.status}</Badge>
    },
    {
      key: 'actions', label: '', className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <Link to={`/orders/${r.order_id}`} className="btn btn-secondary">View</Link>
          {r.status !== 'Completed' && r.status !== 'Cancelled' && (
            <Button variant="danger" onClick={() => remove(r)}>Delete</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-500">Create and manage vendor orders</p>
        </div>
        <Link to="/orders/new" className="btn btn-primary">+ New Order</Link>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by vendor…" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} placeholder="All statuses" options={ORDER_STATUSES} />
        <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      <Table columns={columns} rows={rows} loading={loading} emptyMessage="No orders found" />
    </div>
  );
}
