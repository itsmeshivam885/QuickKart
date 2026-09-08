import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { shopService } from '../../services/shopService';
import { requestService } from '../../services/requestService';
import { reservationService } from '../../services/reservationService';
import { LiveStateToggleCard } from '../../components/shopkeeper/LiveStateToggleCard';
import { ShelfIntelligenceCard } from '../../components/shopkeeper/ShelfIntelligenceCard';
import { ProductFormModal } from '../../components/shopkeeper/ProductFormModal';
import { RespondModal } from '../../components/shopkeeper/RespondModal';
import { Badge } from '../../components/common/Badge';
import {
  Store,
  Package,
  AlertTriangle,
  Send,
  ShoppingBag,
  Star,
  Plus,
  RefreshCw,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export const ShopDashboardPage = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [stats, setStats] = useState({ productCount: 0, lowStockCount: 0 });
  const [requests, setRequests] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchDashboardData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    try {
      const [shopRes, reqRes, resRes] = await Promise.all([
        shopService.getMyShop(),
        requestService.getShopRelevantRequests(),
        reservationService.getShopReservations(),
      ]);

      if (shopRes.success) {
        setShop(shopRes.shop);
        setStats(shopRes.stats);
      }
      if (reqRes.success) setRequests(reqRes.requests);
      if (resRes.success) setReservations(resRes.reservations);
    } catch (err) {
      console.error('Error loading shop dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
  }, []);

  const pendingRequestsCount = requests.filter((r) => !r.myResponse).length;
  const activeReservationsCount = reservations.filter((r) =>
    ['PENDING', 'CONFIRMED', 'READY'].includes(r.status)
  ).length;

  if (loading) {
    return (
      <div className="text-center py-24 space-y-2">
        <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading Shopkeeper Hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              Shopkeeper Control Hub
            </span>
            {shop?.verificationStatus === 'verified' && (
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Verified Shop
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {shop?.shopName || 'My Local Store'}
          </h1>
          <p className="text-xs text-slate-500">
            {shop?.address?.street}, {shop?.address?.area}, {shop?.address?.city} • {shop?.category}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
          <button
            onClick={() => fetchDashboardData(false)}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Catalog Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Catalog Items
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats.productCount || 0}
            </h3>
            <Link to="/shop/products" className="text-[11px] text-brand-600 font-semibold hover:underline">
              Manage inventory &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* 2. Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Low Stock Alerts
            </span>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {stats.lowStockCount || 0}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Needs restocking</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* 3. Pending Broadcast Inquiries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Inquiries
            </span>
            <h3 className="text-2xl font-black text-brand-600 mt-1">
              {pendingRequestsCount}
            </h3>
            <Link to="/shop/requests" className="text-[11px] text-brand-600 font-semibold hover:underline">
              Send quotes &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Send className="w-6 h-6" />
          </div>
        </div>

        {/* 4. Active Holds / Reservations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Holds
            </span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {activeReservationsCount}
            </h3>
            <Link to="/shop/reservations" className="text-[11px] text-emerald-600 font-semibold hover:underline">
              Process orders &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Live Business Model Card (Chapter 16.4 / Fig 16.4) */}
      <LiveStateToggleCard shop={shop} onUpdate={(updated) => setShop(updated)} />

      {/* Shelf & Perishable Expiry Intelligence (Chapter 16.3 / Fig 16.3) */}
      <ShelfIntelligenceCard />

      {/* Two Columns: Recent Inquiries & Recent Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming Inquiries Feed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-brand-600" />
              Incoming Customer Broadcasts
            </h3>
            <Link to="/shop/requests" className="text-xs font-bold text-brand-600 hover:underline">
              View All ({requests.length}) &rarr;
            </Link>
          </div>

          {requests.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No incoming customer broadcast requests in your radius at the moment.
            </p>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 3).map((r) => (
                <div
                  key={r._id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900">{r.productName}</h4>
                    <p className="text-slate-500">
                      Qty: {r.quantity} {r.unit} • Budget: {r.budget ? `₹${r.budget}` : 'Flexible'}
                    </p>
                    <span className="text-[11px] text-brand-600 font-semibold">
                      {r.distanceKm ? `${r.distanceKm.toFixed(1)} km away` : 'Nearby'}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedRequest(r)}
                    className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm flex-shrink-0"
                  >
                    {r.myResponse ? 'Update Quote' : 'Quote Price'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* In-Store Hold Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              In-Store Holds & Pickup Orders
            </h3>
            <Link to="/shop/reservations" className="text-xs font-bold text-brand-600 hover:underline">
              View All ({reservations.length}) &rarr;
            </Link>
          </div>

          {reservations.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No reservation hold tickets requested yet.
            </p>
          ) : (
            <div className="space-y-3">
              {reservations.slice(0, 3).map((res) => (
                <div
                  key={res._id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded text-[11px]">
                        {res.reservationCode}
                      </span>
                      <Badge
                        variant={
                          res.status === 'READY'
                            ? 'success'
                            : res.status === 'CONFIRMED'
                            ? 'primary'
                            : 'neutral'
                        }
                      >
                        {res.status}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-slate-800">{res.productName}</h4>
                    <p className="text-slate-500">
                      Customer: {res.customerId?.name || 'Customer'} • Total: ₹{res.totalAmount}
                    </p>
                  </div>

                  <Link
                    to="/shop/reservations"
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 text-xs flex-shrink-0"
                  >
                    Manage
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <ProductFormModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        shopCategory={shop?.category}
        onSuccess={() => fetchDashboardData()}
      />

      {/* Respond Modal */}
      {selectedRequest && (
        <RespondModal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          requestItem={selectedRequest}
          onSuccess={() => fetchDashboardData()}
        />
      )}
    </div>
  );
};
