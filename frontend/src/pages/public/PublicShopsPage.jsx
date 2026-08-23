import React, { useState, useEffect } from 'react';
import { useLocation } from '../../context/LocationContext';
import { shopService } from '../../services/shopService';
import { ShopCard } from '../../components/customer/ShopCard';
import { BroadcastRequestModal } from '../../components/customer/BroadcastRequestModal';
import { Store, Search, MapPin, RefreshCw, Filter } from 'lucide-react';

export const PublicShopsPage = () => {
  const { coordinates, addressText, radiusKm, setRadiusKm } = useLocation();
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  const categories = [
    'All',
    'Hardware & Tools',
    'Plumbing & Sanitary',
    'Electrical & Lighting',
    'Stationery & Office',
    'Groceries & Daily Essentials',
    'Electronics & Mobiles',
  ];

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await shopService.getNearbyShops({
        lng: coordinates[0],
        lat: coordinates[1],
        radius: radiusKm,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: search || undefined,
      });
      if (res.success) {
        setShops(res.shops);
      }
    } catch (err) {
      console.error('Error loading shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [coordinates, radiusKm, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Store className="w-3.5 h-3.5" />
            <span>Store Directory & Verified Merchants</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Neighborhood Physical Stores
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified local shops operating near <strong className="text-slate-700">{addressText}</strong> within {radiusKm} km.
          </p>
        </div>

        <button
          onClick={() => setIsBroadcastOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Ask All Shops</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto text-xs pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === c
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchShops();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shops by name, description, category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 space-y-2">
          <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Scanning local merchants...</p>
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Store className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No stores found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try expanding your search radius from the top location bar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <ShopCard key={shop._id} shop={shop} onBroadcastClick={() => setIsBroadcastOpen(true)} />
          ))}
        </div>
      )}

      <BroadcastRequestModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
      />
    </div>
  );
};
