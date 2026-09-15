import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Store, ShieldCheck, MapPin } from 'lucide-react';

const shopIcon = new L.DivIcon({
  className: 'custom-shop-marker',
  html: `<div style="background-color: #0f172a; color: #38bdf8; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid #38bdf8; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const ShopLocationMap = ({ shop }) => {
  if (!shop) return null;

  // Handle both coordinates formats
  let lat = null;
  let lng = null;
  
  if (shop.location_lat && shop.location_lng) {
    lat = shop.location_lat;
    lng = shop.location_lng;
  } else if (shop.location && shop.location.coordinates) {
    lng = shop.location.coordinates[0];
    lat = shop.location.coordinates[1];
  }

  if (!lat || !lng) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3">
        <MapPin className="w-8 h-8 text-slate-300" />
        <h4 className="text-sm font-bold text-slate-700">Location Not Set</h4>
        <p className="text-xs text-slate-500">Your shop location coordinates are not available.</p>
      </div>
    );
  }

  const center = [lat, lng];

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex flex-shrink-0 items-center justify-center text-brand-600">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 leading-tight">📍 My Shop Location</h3>
          <p className="text-xs text-slate-500">Your registered storefront location</p>
        </div>
      </div>
      
      <div className="h-64 sm:h-80 w-full relative rounded-2xl overflow-hidden border border-slate-200">
        <MapContainer
          center={center}
          zoom={16}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={center} zoom={16} />
          
          <Marker position={center} icon={shopIcon}>
            <Popup>
              <div className="w-48 p-1">
                <h4 className="font-bold text-sm text-slate-900 leading-tight mb-1">{shop.shopName || shop.shop_name}</h4>
                <p className="text-xs text-slate-600 font-medium mb-1">{shop.category}</p>
                <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                  {shop.address?.street}, {shop.address?.area}, {shop.address?.city}
                </p>
                {shop.verificationStatus === 'verified' && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Store
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};
