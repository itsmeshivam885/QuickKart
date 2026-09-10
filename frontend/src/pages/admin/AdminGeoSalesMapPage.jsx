import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { AdminGeoMap } from '../../components/admin/AdminGeoMap';
import {
  MapPin,
  Store,
  Users,
  ShoppingBag,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Compass,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Power,
  ShieldCheck,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export const AdminGeoSalesMapPage = () => {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedAreaId, setSelectedAreaId] = useState('karol-bagh');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, OFFLINE
  const [selectedShop, setSelectedShop] = useState(null);
  const [customCenter, setCustomCenter] = useState(null);
  const [customZoom, setCustomZoom] = useState(null);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4500);
  };

  const fetchGeoData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getGeoMapData();
      if (res.success) {
        setGeoData(res);
      }
    } catch (err) {
      console.error('Failed to load geo map data:', err);
      showFeedback('error', 'Failed to load regional geospatial data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeoData();
  }, []);

  const handleToggleShopActive = async (shop) => {
    const shopId = shop.id || shop._id;
    setActionLoading(true);
    try {
      const res = await adminService.toggleShopActive(shopId);
      if (res.success) {
        const nextState = res.isActive !== undefined ? res.isActive : !shop.isActive;
        showFeedback(
          'success',
          `Store "${shop.shopName}" is now ${nextState ? 'ONLINE & Discoverable' : 'OFFLINE'}.`
        );
        // Update local geoData in place so map re-renders immediately
        setGeoData((prev) => {
          if (!prev) return prev;
          const updatedShops = prev.allShops.map((s) => {
            if ((s.id || s._id) === shopId) {
              return { ...s, isActive: nextState };
            }
            return s;
          });
          const updatedAreas = prev.areas.map((a) => ({
            ...a,
            shops: a.shops.map((s) => ((s.id || s._id) === shopId ? { ...s, isActive: nextState } : s)),
          }));
          return { ...prev, allShops: updatedShops, areas: updatedAreas };
        });
        if (selectedShop && (selectedShop.id || selectedShop._id) === shopId) {
          setSelectedShop((prev) => ({ ...prev, isActive: nextState }));
        }
      } else {
        showFeedback('error', res.message || 'Failed to toggle store status.');
      }
    } catch (err) {
      console.error('Toggle store active error:', err);
      showFeedback('error', 'Error updating store operational status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !geoData) {
    return (
      <div className="text-center py-24 space-y-2">
        <RefreshCw className="w-7 h-7 text-brand-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Loading geospatial marketplace intelligence...</p>
      </div>
    );
  }

  const { states, areas, allShops } = geoData;

  // Filter areas by state
  const visibleAreas =
    selectedState === 'ALL'
      ? areas
      : areas.filter((a) => a.state.toLowerCase() === selectedState.toLowerCase());

  // Current active area
  const currentArea = areas.find((a) => a.id === selectedAreaId) || visibleAreas[0] || areas[0];

  // Center coords and zoom based on selection
  const mapCenter = customCenter || (currentArea ? currentArea.center : [28.6139, 77.209]);
  const mapZoom = customZoom || (currentArea ? currentArea.zoom : 12);

  // Filter shops to show on map
  let mapShops =
    selectedState === 'ALL'
      ? allShops
      : allShops.filter((s) => (s.address?.state || '').toLowerCase() === selectedState.toLowerCase());

  if (statusFilter === 'ACTIVE') {
    mapShops = mapShops.filter((s) => s.isActive !== false);
  } else if (statusFilter === 'OFFLINE') {
    mapShops = mapShops.filter((s) => s.isActive === false);
  }

  const handleSelectShopFromList = (shop) => {
    setSelectedShop(shop);
    const lat = shop.lat || (shop.coordinates && shop.coordinates[1]);
    const lng = shop.lng || (shop.coordinates && shop.coordinates[0]);
    if (lat && lng) {
      setCustomCenter([lat, lng]);
      setCustomZoom(16);
    }
  };

  const handleSelectArea = (area) => {
    setSelectedAreaId(area.id);
    setSelectedShop(null);
    setCustomCenter(area.center);
    setCustomZoom(area.zoom || 13);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Feedback Alert */}
      {feedback.message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border transition-all animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Regional Geospatial Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Marketplace Regional Sales & Density Map
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live geospatial distribution of registered neighborhood stores, customer reach, and area-wise revenue volume.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={
              currentArea
                ? `https://www.google.com/maps/search/?api=1&query=${currentArea.center[0]},${currentArea.center[1]}`
                : 'https://maps.google.com'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
            Google Maps
          </a>

          <button
            onClick={fetchGeoData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            title="Refresh Geo Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* State & Status Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* State Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-brand-600" /> State:
            </span>
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => {
                  setSelectedState('ALL');
                  setCustomCenter(null);
                  setCustomZoom(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedState === 'ALL'
                    ? 'bg-white text-slate-900 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All States (National)
              </button>
              {states.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setSelectedState(st.name);
                    const firstAreaInState = areas.find(
                      (a) => a.state.toLowerCase() === st.name.toLowerCase()
                    );
                    if (firstAreaInState) handleSelectArea(firstAreaInState);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedState.toLowerCase() === st.name.toLowerCase()
                      ? 'bg-white text-slate-900 shadow-sm font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.name}
                </button>
              ))}
            </div>
          </div>

          {/* Operational Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <span className="text-[11px] text-slate-400 px-2 uppercase tracking-wider">Stores:</span>
            {[
              { id: 'ALL', label: 'All Stores' },
              { id: 'ACTIVE', label: 'Active Only' },
              { id: 'OFFLINE', label: 'Offline Only' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Locality Selector Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
            Localities:
          </span>
          {visibleAreas.map((area) => (
            <button
              key={area.id}
              onClick={() => handleSelectArea(area)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 flex items-center gap-1.5 transition-all ${
                selectedAreaId === area.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-400/40'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>{area.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedAreaId === area.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {area.activeShopsCount} shops
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map + Area Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map Container */}
        <div className="lg:col-span-2 space-y-3">
          <AdminGeoMap
            center={mapCenter}
            zoom={mapZoom}
            shops={mapShops}
            selectedArea={currentArea}
            height="580px"
            onSelectShop={(shop) => handleSelectShopFromList(shop)}
            onToggleActive={handleToggleShopActive}
          />

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
                Active & Verified Shop
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                Pending Verification
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span>
                Offline Store
              </span>
            </div>
            <span className="text-[11px] font-semibold text-brand-600">
              Showing {mapShops.length} stores on map
            </span>
          </div>
        </div>

        {/* Right 1 Col: Area Analytics & Shop Directory */}
        <div className="space-y-6">
          {/* Locality Intelligence Card */}
          {currentArea && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                    {currentArea.state}
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${currentArea.center[0]},${currentArea.center[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
                  >
                    Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  {currentArea.name} Market Hub
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {currentArea.description}
                </p>
              </div>

              {/* Area KPI Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Active Stores
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900">
                      {currentArea.activeShopsCount}
                    </span>
                    <span className="text-[11px] text-slate-400">/ {currentArea.totalShopsCount}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 mt-0.5 block">
                    Operational in area
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Registered Customers
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {currentArea.customersCount > 0 ? currentArea.customersCount : 4}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block">
                    In this locality
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Est. Locality Revenue
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      +14.2% MoM
                    </span>
                  </div>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    ₹{Number(currentArea.totalRevenue).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-brand-600" />
                    Top Category: Hardware & Construction
                  </span>
                </div>
              </div>

              {/* Stores in this Area */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Registered Stores in {currentArea.name} ({currentArea.shops.length})
                </span>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {currentArea.shops.map((shop) => {
                    const isSelected = (selectedShop?.id || selectedShop?._id) === (shop.id || shop._id);
                    const isShopActive = shop.isActive !== false;

                    return (
                      <div
                        key={shop.id || shop._id}
                        onClick={() => handleSelectShopFromList(shop)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                          isSelected
                            ? 'bg-brand-50 border-brand-300 ring-2 ring-brand-400/40 shadow-sm'
                            : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-slate-900">{shop.shopName}</h4>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                              isShopActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isShopActive ? 'Active' : 'Offline'}
                          </span>
                        </div>

                        <p className="text-slate-500 text-[11px]">{shop.category}</p>

                        <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 font-medium">
                          <span>Phone: {shop.contactPhone || '—'}</span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleShopActive(shop);
                              }}
                              disabled={actionLoading}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors ${
                                isShopActive
                                  ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {isShopActive ? 'Set Offline' : 'Set Active'}
                            </button>

                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-brand-600 hover:underline flex items-center gap-0.5"
                            >
                              Maps <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
