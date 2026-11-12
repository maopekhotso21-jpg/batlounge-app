// @ts-nocheck
import { useMemo } from 'react';

const WAREHOUSE = { lat: -26.2041, lng: 28.0473 };

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

export default function SupplierMap({ suppliers = [] }) {
  const primarySupplier = suppliers[0];

  const mapQuery = useMemo(() => {
    if (!suppliers.length) return 'South Africa';
    const focus = primarySupplier?.physical_address || primarySupplier?.supplier_name || primarySupplier?.province || 'South Africa';
    return focus;
  }, [suppliers, primarySupplier]);

  const distanceText = useMemo(() => {
    if (!suppliers.length) return 'No suppliers';
    const approx = getDistanceKm(WAREHOUSE, { lat: -26.2, lng: 28.04 });
    return `${approx.toFixed(1)} km from warehouse`;
  }, [suppliers]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Supplier map</p>
          <h3 className="text-base font-semibold">Supplier locations</h3>
        </div>
        <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-100">
          {distanceText}
        </span>
      </div>

      <iframe
        title="Supplier locations map"
        src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=8&output=embed`}
        className="h-[420px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      <div className="flex flex-wrap gap-2 p-4 border-t border-slate-200 bg-slate-50">
        {suppliers.slice(0, 6).map((supplier) => {
          const supplierQuery = supplier.physical_address || supplier.supplier_name || supplier.province || 'South Africa';
          return (
            <a
              key={supplier.supplier_id || supplier.supplier_name}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplierQuery)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700"
            >
              {supplier.supplier_name}
            </a>
          );
        })}
      </div>
    </div>
  );
}