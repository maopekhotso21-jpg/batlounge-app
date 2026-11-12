import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Loader from '../components/ui/Loader.jsx';
import { ordersAPI } from '../services/endpoints.js';
import { getError } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { ORDER_STATUSES, STATUS_COLORS } from '../utils/constants.js';
import { currency, dateShort } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';

// Displays one order and permits allowed workflow status changes.
export default function OrderDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { isAdmin, isSales } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await ordersAPI.get(id);
      setOrder(data);
      setNewStatus(data.status);
    } catch (e) { toast.error(getError(e)); nav('/orders'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const updateStatus = async () => {
    setSaving(true);
    try {
      await ordersAPI.updateStatus(id, newStatus);
      toast.success('Order status updated');
      load();
    } catch (e) { toast.error(getError(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <Loader />;
  if (!order) return null;

  const canChangeStatus = (isAdmin || isSales) &&
    order.status !== 'Cancelled' && order.status !== 'Completed';

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">
            <Link to="/orders" className="hover:underline">← Back to orders</Link>
          </p>
          <h1 className="text-2xl font-bold text-gray-800">Order #{order.order_id}</h1>
          <p className="text-sm text-gray-500">{dateShort(order.order_date)}</p>
        </div>
        <Badge className={STATUS_COLORS[order.status] || 'bg-gray-200'}>
          {order.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="Vendor Information">
          <dl className="space-y-1 text-sm">
            <div><dt className="text-gray-500 inline">Vendor:</dt> <dd className="inline font-medium">{order.vendor_name}</dd></div>
            <div><dt className="text-gray-500 inline">Business:</dt> <dd className="inline">{order.business_name || '—'}</dd></div>
            <div><dt className="text-gray-500 inline">Telephone:</dt> <dd className="inline">{order.telephone || '—'}</dd></div>
            <div><dt className="text-gray-500 inline">Location:</dt> <dd className="inline">{order.location_maseru || '—'}</dd></div>
          </dl>
        </Card>

        <Card title="Order Summary">
          <dl className="space-y-1 text-sm">
            <div><dt className="text-gray-500 inline">Items:</dt> <dd className="inline">{order.items.length}</dd></div>
            <div><dt className="text-gray-500 inline">Total:</dt> <dd className="inline font-bold text-brand-700">{currency(order.total_amount)}</dd></div>
          </dl>

          {canChangeStatus && (
            <div className="mt-4 space-y-3 border-t pt-4">
              <label className="label">Change status</label>
              <select className="input" value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}>
                {ORDER_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Button onClick={updateStatus} loading={saving} disabled={newStatus === order.status}>
                Update Status
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Card title="Order Items">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2">Fruit</th>
                <th className="py-2">Box Size</th>
                <th className="py-2 text-right">Quantity</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.items.map((it) => (
                <tr key={it.order_item_id}>
                  <td className="py-2">{it.fruit_name}</td>
                  <td className="py-2">{it.size_name}</td>
                  <td className="py-2 text-right">{it.quantity_boxes}</td>
                  <td className="py-2 text-right">{currency(it.unit_price)}</td>
                  <td className="py-2 text-right font-medium">{currency(it.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="py-3 text-right font-semibold">Total</td>
                <td className="py-3 text-right font-bold text-brand-700">{currency(order.total_amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}