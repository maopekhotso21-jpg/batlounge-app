import { useEffect, useState } from 'react';
import Table from '../components/ui/Table.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Modal from '../components/ui/Modal.jsx';
import { boxSizesAPI } from '../services/endpoints.js';
import { getError } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { BOX_SIZES } from '../utils/constants.js';

// Manages the administrator's Small, Medium, and Large box-size catalogue.
export default function BoxSizes() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState({ size_name: 'Small', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setRows((await boxSizesAPI.list()).data); }
    catch (e) { toast.error(getError(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.editing) await boxSizesAPI.update(modal.editing.box_size_id, form);
      else await boxSizesAPI.create(form);
      toast.success('Saved');
      setModal({ open: false, editing: null });
      load();
    } catch (err) { toast.error(getError(err)); }
    finally { setSaving(false); }
  };

  const remove = async (r) => {
    if (!confirm(`Delete box size "${r.size_name}"?`)) return;
    try { await boxSizesAPI.remove(r.box_size_id); toast.success('Deleted'); load(); }
    catch (e) { toast.error(getError(e)); }
  };

  const columns = [
    { key: 'box_size_id', label: 'ID', className: 'w-16' },
    { key: 'size_name', label: 'Size' },
    { key: 'description', label: 'Description' },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => { setForm({ size_name: r.size_name, description: r.description || '' }); setModal({ open: true, editing: r }); }}>Edit</Button>
          <Button variant="danger" onClick={() => remove(r)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Box Sizes</h1>
          <p className="text-sm text-gray-500">Small, Medium, Large</p>
        </div>
        <Button onClick={() => { setForm({ size_name: 'Small', description: '' }); setModal({ open: true, editing: null }); }}>+ Add Box Size</Button>
      </div>

      <Table columns={columns} rows={rows} loading={loading} />

      <Modal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit Box Size' : 'Add Box Size'}>
        <form onSubmit={save} className="space-y-4">
          <Select label="Size" value={form.size_name} onChange={(e) => setForm({ ...form, size_name: e.target.value })} options={BOX_SIZES} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, editing: null })}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
