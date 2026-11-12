import { useEffect, useMemo, useState } from 'react';
import Table from '../components/ui/Table.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import Badge from '../components/ui/Badge.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import Card from '../components/ui/Card.jsx';
import { stockAPI, suppliersAPI } from '../services/endpoints.js';
import { getError } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { currency, dateShort, formatNumber } from '../utils/format.js';

// Manages incoming purchases, product stock, low-stock filtering, and price updates.
export default function Stock() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    supplier_id: '', product_id: '', quantity: 1, cost_price: 1,
    purchase_date: new Date().toISOString().slice(0,10)
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [a, b, c] = await Promise.all([
        stockAPI.list({ search, lowStock: lowOnly ? 'true' : '' }),
        stockAPI.purchases(),
        suppliersAPI.list({})
      ]);
      setRows(a.data); setPurchases(b.data); setSuppliers(c.data);
    } catch (e) { toast.error(getError(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [search, lowOnly]); // eslint-disable-line

  const totals = useMemo(() => ({
    totalStock: rows.reduce((s, r) => s + Number(r.available_stock || 0), 0),
    totalValue: rows.reduce((s, r) => s + Number(r.available_stock || 0) * Number(r.unit_price || 0), 0),
    lowCount: rows.filter(r => r.available_stock <= 20).length
  }), [rows]);

  const save = async (ev) => {
    ev.preventDefault();
    if (!form.supplier_id || !form.product_id) return toast.error('Supplier and product required');
    if (form.quantity <= 0) return toast.error('Quantity must be > 0');
    if (form.cost_price <= 0) return toast.error('Cost price must be > 0');
    setSaving(true);
    try {
      await stockAPI.addStock(form);
      toast.success('Stock added');
      setModal(false);
      load();
    } catch (err) { toast.error(getError(err)); }
    finally { setSaving(false); }
  };

  const updatePrice = async (r) => {
    const price = prompt(`New unit price for ${r.fruit_name} - ${r.size_name}:`, r.unit_price);
    if (price === null) return;
    if (isNaN(price) || Number(price) <= 0) return toast.error('Invalid price');
    try {
      await stockAPI.updateProduct(r.product_id, {
        unit_price: Number(price),
        available_stock: r.available_stock,
        status: r.status
      });
      toast.success('Updated');
      load();
    } catch (e) { toast.error(getError(e)); }
  };

  const productOptions = rows.map(r => ({
    value: r.product_id,
    label: `${r.fruit_name} - ${r.size_name} (stock ${r.available_stock})`
  }));

  const supplierOptions = suppliers.map(s => ({
    value: s.supplier_id, label: `${s.supplier_name} (${s.province})`
  }));

  const columns = [
    { key: 'fruit_name', label: 'Fruit' },
    { key: 'size_name', label: 'Box Size' },
    { key: 'unit_price', label: 'Unit Price', render: (r) => currency(r.unit_price) },
    { key: 'available_stock', label: 'Available', render: (r) => formatNumber(r.available_stock) },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge className={r.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200'}>{r.status}</Badge>
    },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <Button variant="secondary" onClick={() => updatePrice(r)}>Update Price</Button>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stock Management</h1>
          <p className="text-sm text-gray-500">Track available stock and record incoming purchases</p>
        </div>
        <Button onClick={() => { setForm({ ...form, supplier_id: '', product_id: '' }); setModal(true); }}>
          + Add Stock
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card><p className="text-sm text-gray-500">Total boxes available</p><p className="text-2xl font-bold">{formatNumber(totals.totalStock)}</p></Card>
        <Card><p className="text-sm text-gray-500">Stock value</p><p className="text-2xl font-bold">{currency(totals.totalValue)}</p></Card>
        <Card><p className="text-sm text-gray-500">Low-stock products (≤20)</p><p className="text-2xl font-bold">{totals.lowCount}</p></Card>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by fruit or box size…" className="md:w-80" />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
          Show low stock only
        </label>
      </div>

      <Table columns={columns} rows={rows} loading={loading} />

      <Card title="Recent Purchases">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Supplier</th>
                <th className="py-2">Province</th>
                <th className="py-2">Product</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {purchases.slice(0, 10).map((p) => (
                <tr key={p.purchase_id}>
                  <td className="py-2">{dateShort(p.purchase_date)}</td>
                  <td className="py-2">{p.supplier_name}</td>
                  <td className="py-2">{p.province}</td>
                  <td className="py-2">{p.fruit_name} — {p.size_name}</td>
                  <td className="py-2 text-right">{p.quantity}</td>
                  <td className="py-2 text-right">{currency(p.cost_price)}</td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr><td colSpan="6" className="py-4 text-center text-gray-500">No purchases yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Stock" size="lg">
        <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Supplier</label>
            <select className="input" value={form.supplier_id}
              onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}>
              <option value="">Select supplier…</option>
              {supplierOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Product (Fruit + Box Size)</label>
            <select className="input" value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
              <option value="">Select product…</option>
              {productOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <Input label="Quantity (boxes)" type="number" min="1" value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <Input label="Cost price per box" type="number" step="0.01" min="0.01" value={form.cost_price}
            onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
          <Input label="Purchase date" type="date" value={form.purchase_date}
            onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Stock</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}