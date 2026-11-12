
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';


// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const WAREHOUSE = {
  lat: -29.3167,
  lng: 27.4833,
  name: 'Batloung Warehouse',
};

const redIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function StreetVendorMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLineRef = useRef<L.GeoJSON | null>(null);
  const vendorMarkerRef = useRef<L.Marker | null>(null);

  const [routeInfo, setRouteInfo] = useState({
    distance: '',
    duration: '',
  });

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      [WAREHOUSE.lat, WAREHOUSE.lng],
      13
    );

    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    L.marker([WAREHOUSE.lat, WAREHOUSE.lng])
      .addTo(map)
      .bindPopup(`<b>Departure:</b> ${WAREHOUSE.name}`);

    // Ensure Leaflet calculates the correct container dimensions.
    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => {
      map.remove();
      mapRef.current = null;
      routeLineRef.current = null;
      vendorMarkerRef.current = null;
    };
  }, []);

  const showDirections = async (
    vendorLat: number,
    vendorLng: number
  ) => {
    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${WAREHOUSE.lng},${WAREHOUSE.lat};${vendorLng},${vendorLat}` +
        `?overview=full&geometries=geojson`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Routing request failed: ${res.status}`);
      }

      const data = await res.json();

      if (!data.routes || !data.routes[0]) {
        console.error('No route found');
        return;
      }

      const route = data.routes[0];

      setRouteInfo({
        distance: `${(route.distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(route.duration / 60)} mins`,
      });

      if (mapRef.current) {
        if (routeLineRef.current) {
          mapRef.current.removeLayer(routeLineRef.current);
        }

        if (vendorMarkerRef.current) {
          mapRef.current.removeLayer(vendorMarkerRef.current);
        }

        routeLineRef.current = L.geoJSON(route.geometry, {
          style: {
            color: 'blue',
            weight: 6,
          },
        }).addTo(mapRef.current);

        vendorMarkerRef.current = L.marker(
          [vendorLat, vendorLng],
          { icon: redIcon }
        )
          .addTo(mapRef.current)
          .bindPopup('<b>Destination:</b> Vendor');

        vendorMarkerRef.current.openPopup();

        mapRef.current.fitBounds(
          routeLineRef.current.getBounds(),
          { padding: [20, 20] }
        );
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">
        Street Vendors Map
      </h2>

      {routeInfo.distance && (
        <div className="mb-2 p-2 bg-green-50 rounded">
          <b>Departure:</b> {WAREHOUSE.name} |{' '}
          <b>Distance:</b> {routeInfo.distance} |{' '}
          <b>ETA:</b> {routeInfo.duration}
        </div>
      )}

      <div
        ref={mapContainerRef}
        style={{
          height: '600px',
          width: '100%',
          borderRadius: '10px',
          backgroundColor: '#e5e7eb',
        }}
      />

      <div className="mt-2 flex gap-2">
        <button
          onClick={() => showDirections(-29.357, 27.48)}
          className="bg-green-700 text-white px-3 py-1 rounded"
        >
          Show Route to Maseru East
        </button>

        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${WAREHOUSE.lat},${WAREHOUSE.lng}&destination=-29.357,27.48`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
