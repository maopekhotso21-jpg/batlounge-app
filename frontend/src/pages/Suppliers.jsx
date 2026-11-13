import { useEffect, useState } from 'react';
import Table from '../components/ui/Table.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Modal from '../components/ui/Modal.jsx';
import Badge from '../components/ui/Badge.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import { suppliersAPI } from '../services/endpoints.js';
import { getError } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { PROVINCES } from '../utils/constants.js';
import SupplierMap from '../SupplierMap';

const EMPTY = {
  supplier_name: '', province: 'Gauteng', contact_person: '',
  telephone: '', email: '', physical_address: '', status: 'Active'
};

export default function Suppliers() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const load = async () => {
    setLoading(true);
    try { setRows((await suppliersAPI.list({ search, province })).data); }
    catch (e) { toast.error(getError(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [search, province]); // eslint-disable-line

  const validate = () => {
    const e = {};
    if (!form.supplier_name.trim()) e.supplier_name = 'Required';
    if (!PROVINCES.includes(form.province)) e.province = 'Invalid';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (modal.editing) await suppliersAPI.update(modal.editing.supplier_id, form);
      else await suppliersAPI.create(form);
      toast.success('Saved');
      setModal({ open: false, editing: null });
      load();
    } catch (err) { toast.error(getError(err)); }
    finally { setSaving(false); }
  };

  const remove = async (r) => {
    if (!confirm(`Delete supplier "${r.supplier_name}"?`)) return;
    try { await suppliersAPI.remove(r.supplier_id); toast.success('Deleted'); load(); }
    catch (e) { toast.error(getError(e)); }
  };

  const columns = [
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'province', label: 'Province' },
    { key: 'contact_person', label: 'Contact' },
    { key: 'telephone', label: 'Telephone' },
    { key: 'email', label: 'Email' },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge className={r.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200'}>{r.status}</Badge>
    },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => {
            setForm({ ...EMPTY, ...r });
            setModal({ open: true, editing: r });
          }}>Edit</Button>
          <Button variant="danger" onClick={() => remove(r)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
          <p className="text-sm text-gray-500">Fruit suppliers across the 9 South African provinces</p>
        </div>
        <Button onClick={() => { setForm(EMPTY); setErrors({}); setModal({ open: true, editing: null }); }}>
          + Add Supplier
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search suppliers…" className="md:w-72" />
        <Select
          value={province} onChange={(e) => setProvince(e.target.value)}
          placeholder="All provinces" options={PROVINCES} className="md:w-64"
        />
      </div>

      <Table columns={columns} rows={rows} loading={loading} emptyMessage="No suppliers found" />

      {/* --- SUPPLIER MAP SECTION --- */}
      {rows.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Supplier Locations</h2>
          <SupplierMap suppliers={rows} />
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit Supplier' : 'Add Supplier'} size="lg">
        <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
          <Input label="Supplier name" value={form.supplier_name} error={errors.supplier_name}
            onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} />
          <Select label="Province" value={form.province} error={errors.province}
            onChange={(e) => setForm({ ...form, province: e.target.value })} options={PROVINCES} />
          <Input label="Contact person" value={form.contact_person || ''}
            onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          <Input label="Telephone" value={form.telephone || ''}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          <Input label="Email" type="email" value={form.email || ''} error={errors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Select label="Status" value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={['Active','Inactive']} />
          <Input label="Physical address" className="md:col-span-2" value={form.physical_address || ''}
            onChange={(e) => setForm({ ...form, physical_address: e.target.value })} />

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, editing: null })}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
