import { useEffect, useState } from 'react';
import Table from '../components/ui/Table.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Modal from '../components/ui/Modal.jsx';
import Badge from '../components/ui/Badge.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import { vendorsAPI } from '../services/endpoints.js';
import { getError } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { VENDOR_STATUS_COLORS } from '../utils/constants.js';
import { dateShort } from '../utils/format.js';
 
const EMPTY = {
  vendor_name: '', business_name: '', telephone: '',
  location_maseru: '', registration_date: '',
  status: 'Active'
};

const WAREHOUSE_COORDS = { lat: -29.3167, lng: 27.4833 };
const LOCATION_COORDS = {
  'maseru east': { lat: -29.3284, lng: 27.5247 },
  'maseru west': { lat: -29.3051, lng: 27.4599 },
  'maseru north': { lat: -29.287, lng: 27.4687 },
  'maseru south': { lat: -29.3376, lng: 27.4981 },
  'maseru central': { lat: -29.3122, lng: 27.4833 },
  'seta': { lat: -29.2674, lng: 27.5041 },
  'qoaling': { lat: -29.2685, lng: 27.5679 },
  'ha rasebei': { lat: -29.3561, lng: 27.4342 },
  'bokong': { lat: -29.3785, lng: 27.4842 },
  'liphiring': { lat: -29.3664, lng: 27.5539 }
};

const toRadians = (value) => (value * Math.PI) / 180;

const getDistanceKm = (pointA, pointB) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getVendorMapLocation = (locationText = '') => {
  const normalized = String(locationText || '').toLowerCase();
  const matched = Object.keys(LOCATION_COORDS).find((key) => normalized.includes(key));
  return matched ? LOCATION_COORDS[matched] : { lat: -29.3122, lng: 27.4833 };
};

export default function Vendors() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [registeredFilter, setRegisteredFilter] = useState('Registered vendors');
  const [registeredDate, setRegisteredDate] = useState('');
  const [modal, setModal] = useState({ open: false, editing: null });
  const [viewVendor, setViewVendor] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [registerAfterAdd, setRegisterAfterAdd] = useState(false);

  const handleView = (vendor) => setViewVendor(vendor || null);
  const vendorMapLocation = viewVendor ? getVendorMapLocation(viewVendor.location_maseru) : null;
  const vendorDistanceKm = vendorMapLocation ? getDistanceKm(WAREHOUSE_COORDS, vendorMapLocation) : null;

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setRegisteredFilter('Registered vendors');
    setRegisteredDate('');
  };

  const load = async () => {
    setLoading(true);
    try {
      setRows((await vendorsAPI.list({
        search,
        status,
        registered: registeredFilter === 'Registered vendors' ? 'true' : registeredFilter === 'Not registered vendors' ? 'false' : undefined,
        registration_date: registeredDate
      })).data);
    } catch (e) { toast.error(getError(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [search, status, registeredFilter, registeredDate]); // eslint-disable-line

  const save = async (ev) => {
    ev.preventDefault();
    if (!form.vendor_name.trim()) return toast.error('Vendor name is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        registration_date: form.registration_date || null,
      };

      if (modal.editing) await vendorsAPI.update(modal.editing.vendor_id, payload);
      else if (!registerAfterAdd) await vendorsAPI.create({ ...payload, registration_date: null });
      else await vendorsAPI.create({ ...payload, registration_date: payload.registration_date || new Date().toISOString().slice(0, 10) });

      toast.success('Saved');
      setModal({ open: false, editing: null });
      setRegisterAfterAdd(false);
      load();
    } catch (err) { toast.error(getError(err)); }
    finally { setSaving(false); }
  };

  const registerVendorLater = async (r) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      await vendorsAPI.update(r.vendor_id, { ...r, registration_date: today, status: r.status || 'Active' });
      toast.success('Vendor registered');
      load();
    } catch (e) { toast.error(getError(e)); }
  };

  const remove = async (r) => {
    if (!confirm(`Delete vendor "${r.vendor_name}"?`)) return;
    try { await vendorsAPI.remove(r.vendor_id); toast.success('Deleted'); load(); }
    catch (e) { toast.error(getError(e)); }
  };

  const columns = [
    { key: 'vendor_id', label: 'ID', className: 'w-16' },
    { key: 'vendor_name', label: 'Vendor' },
    { key: 'business_name', label: 'Business' },
    { key: 'telephone', label: 'Telephone' },
    { key: 'location_maseru', label: 'Location (Maseru)' },
    { key: 'registration_date', label: 'Registered', render: (r) => dateShort(r.registration_date) },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge className={VENDOR_STATUS_COLORS[r.status] || 'bg-gray-200'}>{r.status}</Badge>
    },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          {!r.registration_date && (
            <Button variant="secondary" onClick={() => registerVendorLater(r)}>Register</Button>
          )}
          <Button variant="secondary" onClick={() => { setForm({ ...EMPTY, ...r, registration_date: r.registration_date || '' }); setModal({ open: true, editing: r }); }}>Edit</Button>
          <Button variant="ghost" onClick={() => handleView(r)}>View</Button>
          <Button variant="danger" onClick={() => remove(r)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Street Vendors</h1>
          <p className="text-sm text-gray-500">Register and manage vendors in Maseru</p>
        </div>
        <Button onClick={() => { setForm({ ...EMPTY, registration_date: '' }); setRegisterAfterAdd(false); setModal({ open: true, editing: null }); }}>+ Add Vendor</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search vendors…" className="md:w-72" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} placeholder="All statuses" options={['Active', 'Inactive']} className="md:w-48" />
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <Select
          value={registeredFilter}
          onChange={(e) => setRegisteredFilter(e.target.value)}
          options={['Registered vendors', 'Not registered vendors']}
          className="md:w-60"
        />
        <Input
          type="date"
          label="Date registered"
          value={registeredDate}
          onChange={(e) => setRegisteredDate(e.target.value)}
          className="md:w-52"
        />
        <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>
      </div>

      <Table columns={columns} rows={rows} loading={loading} />

      <Modal open={Boolean(viewVendor)} onClose={() => setViewVendor(null)} title="Vendor Details" size="xl">
        {viewVendor && (
          <div className="grid md:grid-cols-2 gap-5 text-sm">
            <div className="space-y-2 md:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Vendor</p>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-gray-800">{viewVendor.vendor_name}</h2>
                <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">
                  {vendorDistanceKm ? `${vendorDistanceKm.toFixed(1)} km away` : 'Location available'}
                </span>
              </div>
            </div>

            <div><p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Business name</p><p className="mt-1 font-medium">{viewVendor.business_name || '—'}</p></div>
            <div><p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Status</p><p className="mt-1"><Badge className={VENDOR_STATUS_COLORS[viewVendor.status] || 'bg-gray-200'}>{viewVendor.status}</Badge></p></div>
            <div><p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Telephone</p><p className="mt-1 font-medium">{viewVendor.telephone || '—'}</p></div>
            <div><p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Location</p><p className="mt-1 font-medium">{viewVendor.location_maseru || '—'}</p></div>
            <div><p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Registration date</p><p className="mt-1 font-medium">{dateShort(viewVendor.registration_date)}</p></div>
            <div><p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Vendor ID</p><p className="mt-1 font-medium">{viewVendor.vendor_id}</p></div>

            <div className="md:col-span-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Route overview</p>
                    <h3 className="text-sm font-semibold">Batloung warehouse to vendor</h3>
                  </div>
                  <div className="rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-100">
                    {vendorDistanceKm ? `${vendorDistanceKm.toFixed(1)} km` : 'Map view'}
                  </div>
                </div>

                <iframe
                  title={`${viewVendor.vendor_name} location map`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(`${viewVendor.vendor_name} ${viewVendor.location_maseru || 'Maseru Lesotho'}`)}&z=14&output=embed`}
                  className="h-64 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${WAREHOUSE_COORDS.lat},${WAREHOUSE_COORDS.lng}&destination=${vendorMapLocation.lat},${vendorMapLocation.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
              >
                Open in Google Maps
              </a>
              <Button variant="secondary" onClick={() => setViewVendor(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit Vendor' : 'Add Vendor'} size="lg">
        <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
          <Input label="Vendor name" value={form.vendor_name}
            onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} />
          <Input label="Business name" value={form.business_name || ''}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
          <Input label="Telephone" value={form.telephone || ''}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          <Input label="Location (Maseru)" value={form.location_maseru || ''}
            onChange={(e) => setForm({ ...form, location_maseru: e.target.value })} />
          <Input label="Registration date" type="date" value={form.registration_date || ''}
            onChange={(e) => setForm({ ...form, registration_date: e.target.value })} />
          <Select label="Status" value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={['Active','Inactive']} />

          {!modal.editing && (
            <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={registerAfterAdd}
                onChange={(e) => setRegisterAfterAdd(e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              I should register the vendor after adding it
            </label>
          )}

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, editing: null })}>Cancel</Button>
            <Button type="submit" loading={saving}>{!modal.editing && registerAfterAdd ? 'Register Vendor' : 'Add Vendor'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}