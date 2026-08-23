import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { shopService } from '../../services/shopService';
import { productService } from '../../services/productService';
import { chatService } from '../../services/chatService';
import { ShopCard } from '../../components/customer/ShopCard';
import { ProductCard } from '../../components/customer/ProductCard';
import { MapView } from '../../components/common/MapView';
import { BroadcastRequestModal } from '../../components/customer/BroadcastRequestModal';
import { ReservationModal } from '../../components/customer/ReservationModal';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Map,
  Grid,
  Store,
  Package,
  Sparkles,
  RefreshCw,
  Send,
} from 'lucide-react';

export const DiscoverFeed = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { coordinates, addressText, radiusKm, setRadiusKm } = useLocation();
  const { isAuthenticated, role } = useAuth();

  const [activeTab, setActiveTab] = useState('shops'); // 'shops' | 'products'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'rating' | 'price_asc'
  
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [reserveTarget, setReserveTarget] = useState(null);

  const categories = [
    'All',
    'Hardware & Tools',
    'Plumbing & Sanitary',
    'Electrical & Lighting',
    'Stationery & Office',
    'Groceries & Daily Essentials',
    'Electronics & Mobiles',
  ];

  // Fetch shops and products
  const fetchData = async () => {
    setLoading(true);
    try {
      const [shopRes, prodRes] = await Promise.all([
        shopService.getNearbyShops({
          lng: coordinates[0],
          lat: coordinates[1],
          radius: radiusKm,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          search: searchQuery || undefined,
        }),
        productService.getProducts({
          lng: coordinates[0],
          lat: coordinates[1],
          radius: radiusKm,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          search: searchQuery || undefined,
          sort: sortBy,
        }),
      ]);

      if (shopRes.success) setShops(shopRes.shops);
      if (prodRes.success) setProducts(prodRes.products);
    } catch (err) {
      console.error('Error loading discover feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [coordinates, radiusKm, selectedCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleChatWithProduct = async (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await chatService.getOrCreateConversation({
        shopId: product.shopId._id || product.shopId,
        productName: product.name,
        price: product.price,
      });
      if (res.success) {
        navigate(`/customer/messages?c=${res.conversation._id}`);
      }
    } catch (err) {
      console.error('Failed to open chat:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Search Header */}
      <div className="bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span>Hyperlocal Discovery Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Discover Verified Shops Around You
          </h1>

          <p className="text-xs sm:text-sm text-slate-300">
            Real-time stock, pricing, and shop capabilities within{' '}
            <strong className="text-white">{radiusKm} km</strong> of{' '}
            <strong className="text-brand-400">{addressText}</strong>.
          </p>

          {/* Search bar inside header */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or shops (e.g. PVC pipe, drill, switch, notebook)..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-slate-900 text-xs font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 font-bold text-xs text-white shadow-md shadow-brand-500/30 transition-colors flex-shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Broadcast CTA Strip */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-amber-900">
              Can't find the exact item you need?
            </h4>
            <p className="text-xs text-amber-800">
              Broadcast a custom request to all nearby shops simultaneously and receive instant quotes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsBroadcastOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 flex-shrink-0 w-full sm:w-auto justify-center"
        >
          <Send className="w-3.5 h-3.5" />
          Broadcast Request Now
        </button>
      </div>

      {/* Filters & Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tab & View Mode switchers */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Shops vs Products Tab */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('shops')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'shops'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Nearby Shops ({shops.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'products'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Product Catalog ({products.length})
            </button>
          </div>

          {/* Right Toolbar: View Toggle & Sort */}
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none"
              >
                <option value="distance">Nearest Distance</option>
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low to High</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'map' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'
                }`}
                title="Map view"
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <MapView
            userCoords={coordinates}
            shops={shops}
            radiusKm={radiusKm}
            height="550px"
          />
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="text-center py-16 space-y-2">
              <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Scanning verified stores in {addressText}...
              </p>
            </div>
          ) : activeTab === 'shops' ? (
            shops.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
                <Store className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No shops found within {radiusKm} km
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try expanding your search radius to 10km or 20km from the top bar, or broadcast a request!
                </p>
                <button
                  onClick={() => setRadiusKm(10)}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20"
                >
                  Expand Radius to 10km
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map((shop) => (
                  <ShopCard
                    key={shop._id}
                    shop={shop}
                    onBroadcastClick={(s) => setIsBroadcastOpen(true)}
                  />
                ))}
              </div>
            )
          ) : products.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No shops have listed this item directly. Send a broadcast request to get instant custom quotes!
              </p>
              <button
                onClick={() => setIsBroadcastOpen(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20"
              >
                Broadcast Request for this Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onReserveClick={(p) => setReserveTarget(p)}
                  onChatClick={handleChatWithProduct}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Broadcast Request Modal */}
      <BroadcastRequestModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        initialProduct={searchQuery}
        initialCategory={selectedCategory !== 'All' ? selectedCategory : 'Hardware & Tools'}
        onSuccess={() => navigate('/customer/requests')}
      />

      {/* Reservation Hold Modal */}
      {reserveTarget && (
        <ReservationModal
          isOpen={!!reserveTarget}
          onClose={() => setReserveTarget(null)}
          targetItem={reserveTarget}
          onSuccess={() => navigate('/customer/reservations')}
        />
      )}
    </div>
  );
};
