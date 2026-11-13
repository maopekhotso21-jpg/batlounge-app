import { useEffect, useMemo, useState } from 'react';
import Table from '../components/ui/Table.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Modal from '../components/ui/Modal.jsx';
import Badge from '../components/ui/Badge.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import { fruitsAPI } from '../services/endpoints.js';
import { getError } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

// Manages the administrator fruit catalogue with search, filtering, and CRUD forms.
export default function Fruits() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState({ fruit_name: '', status: 'Active' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fruitsAPI.list({ search, status });
      setRows(data);
    } catch (e) { toast.error(getError(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, status]); // eslint-disable-line

  const openCreate = () => { setForm({ fruit_name: '', status: 'Active' }); setModal({ open: true, editing: null }); };
  const openEdit = (r) => { setForm({ fruit_name: r.fruit_name, status: r.status }); setModal({ open: true, editing: r }); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.fruit_name.trim()) return toast.error('Fruit name is required');
    setSaving(true);
    try {
      if (modal.editing) {
        await fruitsAPI.update(modal.editing.fruit_id, form);
        toast.success('Fruit updated');
      } else {
        await fruitsAPI.create(form);
        toast.success('Fruit created');
      }
      setModal({ open: false, editing: null });
      load();
    } catch (err) { toast.error(getError(err)); }
    finally { setSaving(false); }
  };

  const remove = async (r) => {
    if (!confirm(`Delete fruit "${r.fruit_name}"?`)) return;
    try {
      await fruitsAPI.remove(r.fruit_id);
      toast.success('Fruit deleted');
      load();
    } catch (e) { toast.error(getError(e)); }
  };

  const columns = useMemo(() => ([
    { key: 'fruit_id', label: 'ID', className: 'w-16' },
    { key: 'fruit_name', label: 'Fruit Name' },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge className={r.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}>{r.status}</Badge>
    },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => openEdit(r)}>Edit</Button>
          <Button variant="danger" onClick={() => remove(r)}>Delete</Button>
        </div>
      )
    }
  ]), []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fruits</h1>
          <p className="text-sm text-gray-500">Manage the 5 fruit varieties sold by Batloung</p>
        </div>
        <Button onClick={openCreate}>+ Add Fruit</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search fruits…" className="md:w-72" />
        <Select
          value={status} onChange={(e) => setStatus(e.target.value)}
          placeholder="All statuses"
          options={['Active','Inactive']}
          className="md:w-48"
        />
      </div>

      <Table columns={columns} rows={rows} loading={loading} emptyMessage="No fruits found" />

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit Fruit' : 'Add Fruit'}
      >
        <form onSubmit={save} className="space-y-4">
          <Input
            label="Fruit name"
            value={form.fruit_name}
            onChange={(e) => setForm({ ...form, fruit_name: e.target.value })}
            placeholder="e.g. Apples"
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={['Active','Inactive']}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, editing: null })}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}