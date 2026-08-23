import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Store, Navigation, Star, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix Leaflet's default marker icons broken by Webpack/Vite bundlers
delete L.Icon.Default.prototype._getIconUrl;

const userIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #0ea5e9; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(14, 165, 233, 0.8);" class="pulse-active"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const shopIcon = new L.DivIcon({
  className: 'custom-shop-marker',
  html: `<div style="background-color: #0f172a; color: #38bdf8; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid #38bdf8; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Component to dynamically re-center map when user location or radius changes
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapView = ({ userCoords, shops = [], radiusKm = 5, height = '450px', onRequestShop }) => {
  const center = [userCoords[1], userCoords[0]]; // [lat, lng] for leaflet

  return (
    <div style={{ height }} className="w-full relative rounded-2xl overflow-hidden shadow-lg border border-slate-200">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} zoom={radiusKm <= 3 ? 14 : radiusKm <= 10 ? 13 : 11} />

        {/* Radius Circle */}
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{
            color: '#0ea5e9',
            fillColor: '#0ea5e9',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '4, 8',
          }}
        />

        {/* User Location Marker */}
        <Marker position={center} icon={userIcon}>
          <Popup>
            <div className="text-center font-medium p-1">
              <span className="text-brand-600 font-bold block">📍 Your Location</span>
              <span className="text-xs text-slate-500">Searching within {radiusKm} km radius</span>
            </div>
          </Popup>
        </Marker>

        {/* Shop Markers */}
        {shops.map((shop) => {
          if (!shop.location || !shop.location.coordinates) return null;
          const shopPos = [shop.location.coordinates[1], shop.location.coordinates[0]];

          return (
            <Marker key={shop._id} position={shopPos} icon={shopIcon}>
              <Popup>
                <div className="w-56 p-1 text-slate-800">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {shop.shopName}
                    </h4>
                    <span className="bg-amber-50 text-amber-700 text-xs px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 flex-shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {shop.rating}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{shop.category}</p>
                  <p className="text-xs text-slate-600 mb-2">
                    {shop.address?.street}, {shop.address?.city}
                  </p>

                  <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-slate-100">
                    <span className="text-brand-600 font-bold">
                      {shop.distanceKm ? `${shop.distanceKm.toFixed(1)} km away` : 'Nearby'}
                    </span>
                    <Link
                      to={`/shops/${shop._id}`}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium underline"
                    >
                      View Shop &rarr;
                    </Link>
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
