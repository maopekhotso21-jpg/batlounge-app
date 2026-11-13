import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import { ordersAPI, vendorsAPI, stockAPI } from '../services/endpoints.js';
import { getError } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { currency } from '../utils/format.js';

// Builds and submits a multi-line order for an active registered vendor.
export default function CreateOrder() {
  const toast = useToast();
  const nav = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([{ product_id: '', quantity_boxes: 1 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [v, s] = await Promise.all([
          vendorsAPI.list({ status: 'Active' }),
          stockAPI.list({})
        ]);
        setVendors(v.data);
        setProducts(s.data);
      } catch (e) { toast.error(getError(e)); }
    })();
  }, []); // eslint-disable-line

  const productMap = useMemo(
    () => Object.fromEntries(products.map(p => [p.product_id, p])),
    [products]
  );

  const lineInfo = (item) => {
    const p = productMap[item.product_id];
    const price = p ? Number(p.unit_price) : 0;
    const qty = Number(item.quantity_boxes) || 0;
    return { price, qty, subtotal: +(price * qty).toFixed(2), stock: p?.available_stock ?? 0 };
  };

  const total = items.reduce((s, it) => s + lineInfo(it).subtotal, 0);

  const addLine = () => setItems([...items, { product_id: '', quantity_boxes: 1 }]);
  const removeLine = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateLine = (i, patch) => setItems(items.map((it, idx) => idx === i ? { ...it, ...patch } : it));

  const validate = () => {
    if (!vendorId) return 'Select a vendor';
    if (!orderDate) return 'Select order date';
    for (const it of items) {
      if (!it.product_id) return 'Every line needs a product';
      if (!(Number(it.quantity_boxes) > 0)) return 'Quantity must be > 0';
      const info = lineInfo(it);
      if (info.qty > info.stock) return `Insufficient stock for product`;
    }
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);
    setSaving(true);
    try {
      const payload = {
        vendor_id: Number(vendorId),
        order_date: orderDate,
        items: items.map(it => ({
          product_id: Number(it.product_id),
          quantity_boxes: Number(it.quantity_boxes)
        }))
      };
      const { data } = await ordersAPI.create(payload);
      toast.success(`Order #${data.order_id} created`);
      nav(`/orders/${data.order_id}`);
    } catch (e2) { toast.error(getError(e2)); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Create Order</h1>
        <p className="text-sm text-gray-500">Place an order for a registered street vendor</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <Card title="Order Details">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Street Vendor</label>
              <select className="input" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                <option value="">Select vendor…</option>
                {vendors.map(v => (
                  <option key={v.vendor_id} value={v.vendor_id}>
                    {v.vendor_name} — {v.business_name || '—'} ({v.location_maseru || '—'})
                  </option>
                ))}
              </select>
            </div>
            <Input label="Order Date" type="date" value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)} />
          </div>
        </Card>

        <Card
          title="Order Items"
          action={<Button variant="secondary" onClick={addLine}>+ Add Item</Button>}
        >
          <div className="space-y-3">
            {items.map((it, i) => {
              const info = lineInfo(it);
              const p = productMap[it.product_id];
              return (
                <div key={i} className="grid md:grid-cols-12 gap-3 items-end border rounded-lg p-3 bg-gray-50">
                  <div className="md:col-span-6">
                    <label className="label">Product</label>
                    <select className="input" value={it.product_id}
                      onChange={(e) => updateLine(i, { product_id: e.target.value })}>
                      <option value="">Select…</option>
                      {products.map(pr => (
                        <option key={pr.product_id} value={pr.product_id} disabled={pr.available_stock <= 0}>
                          {pr.fruit_name} — {pr.size_name} · {currency(pr.unit_price)} · stock {pr.available_stock}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Boxes</label>
                    <input type="number" min="1" className="input"
                      value={it.quantity_boxes}
                      onChange={(e) => updateLine(i, { quantity_boxes: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Subtotal</label>
                    <div className="px-3 py-2 bg-white border rounded-lg text-gray-800 font-medium">
                      {currency(info.subtotal)}
                    </div>
                  </div>
                  <div className="md:col-span-2 flex gap-2 md:justify-end">
                    {items.length > 1 && (
                      <Button variant="danger" onClick={() => removeLine(i)}>Remove</Button>
                    )}
                  </div>
                  {p && info.qty > info.stock && (
                    <p className="md:col-span-12 text-xs text-red-500">
                      Requested {info.qty} exceeds available stock ({info.stock}).
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-5 text-lg font-bold">
            Total: <span className="ml-2 text-brand-700">{currency(total)}</span>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => nav('/orders')}>Cancel</Button>
          <Button type="submit" loading={saving}>Create Order</Button>
        </div>
      </form>
    </div>
  );
}
