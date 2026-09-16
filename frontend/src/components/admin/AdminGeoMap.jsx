import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Store, Star, Phone, ExternalLink, MapPin, CheckCircle, AlertCircle, ShoppingBag, Power } from 'lucide-react';

// Fix Leaflet's default marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;

const createShopIcon = (isActive, verificationStatus) => {
  const bg = !isActive ? '#64748b' : verificationStatus === 'pending' ? '#f59e0b' : '#0ea5e9';
  const border = !isActive ? '#94a3b8' : verificationStatus === 'pending' ? '#d97706' : '#38bdf8';

  return new L.DivIcon({
    className: 'custom-admin-shop-marker',
    html: `
      <div style="
        background-color: #0f172a;
        color: ${bg};
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid ${border};
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
          <path d="M2 7h20"/>
          <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

// Component to dynamically re-center map smoothly when selected area or state changes
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map]);
  return null;
};

export const AdminGeoMap = ({
  center = [28.6517, 77.1906],
  zoom = 13,
  shops = [],
  selectedArea = null,
  height = '560px',
  onSelectShop,
  onToggleActive,
}) => {
  const validCenter = [center[0] || 28.6517, center[1] || 77.1906];

  return (
    <div style={{ height }} className="w-full relative rounded-3xl overflow-hidden shadow-xl border border-slate-200">
      <MapContainer
        center={validCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={validCenter} zoom={zoom} />

        {/* Selected Area Radius Circle */}
        {selectedArea && (
          <Circle
            center={validCenter}
            radius={2500}
            pathOptions={{
              color: '#0284c7',
              fillColor: '#38bdf8',
              fillOpacity: 0.12,
              weight: 2,
              dashArray: '5, 8',
            }}
          />
        )}

        {/* Shop Markers */}
        {shops.map((shop) => {
          const lat = shop.lat || (shop.coordinates && shop.coordinates[1]) || (shop.location?.coordinates && shop.location.coordinates[1]);
          const lng = shop.lng || (shop.coordinates && shop.coordinates[0]) || (shop.location?.coordinates && shop.location.coordinates[0]);

          if (!lat || !lng) return null;

          const markerPos = [lat, lng];
          const isStoreActive = shop.isActive !== false;
          const icon = createShopIcon(isStoreActive, shop.verificationStatus);

          return (
            <Marker
              key={shop.id || shop._id}
              position={markerPos}
              icon={icon}
              eventHandlers={{
                click: () => onSelectShop && onSelectShop(shop),
              }}
            >
              <Popup className="custom-admin-popup">
                <div className="w-64 p-2 text-slate-800 space-y-2.5">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 block">
                        {shop.category || 'Store'}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 leading-tight">
                        {shop.shopName}
                      </h4>
                    </div>

                    <span className="bg-amber-50 text-amber-700 text-[11px] px-1.5 py-0.5 rounded-lg font-bold flex items-center gap-0.5 flex-shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {shop.rating || 4.5}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      isStoreActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isStoreActive ? '● Active' : '○ Offline'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 uppercase text-[10px]">
                      {shop.verificationStatus || 'Verified'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                    <p className="flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>
                        {shop.address?.area || 'Area'}, {shop.address?.city || 'Delhi'}
                      </span>
                    </p>
                    {shop.contactPhone && (
                      <p className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{shop.contactPhone}</span>
                      </p>
                    )}
                    {shop.totalSalesVolume !== undefined && (
                      <p className="flex items-center gap-1 text-brand-600 font-bold">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Est. Sales: ₹{Number(shop.totalSalesVolume).toLocaleString('en-IN')}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-800 font-bold flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Google Maps
                    </a>

                    {onToggleActive && (
                      <button
                        onClick={() => onToggleActive(shop)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors ${
                          isStoreActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {isStoreActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
