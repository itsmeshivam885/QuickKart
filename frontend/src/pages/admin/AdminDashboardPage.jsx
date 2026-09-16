import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Badge } from '../../components/common/Badge';
import {
  ShieldCheck,
  Store,
  Users,
  Package,
  Send,
  ShoppingBag,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="text-center py-24 space-y-2">
        <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading platform analytics...</p>
      </div>
    );
  }

  const { stats, recentRequests, recentReservations } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Operations & Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            QuickKart Platform Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hyperlocal marketplace overview, verification queue, and user account management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/shops"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 font-bold text-xs text-white shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
          >
            <Store className="w-4 h-4" />
            Verification Queue ({stats.shops.pending})
          </Link>
          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Registered Shops */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Stores
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats.shops.total}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {stats.shops.verified} verified stores
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
        </div>

        {/* 2. Platform Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Platform Users
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats.users.total}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {stats.users.customers} customers • {stats.users.shopkeepers} sellers
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* 3. Broadcast Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Broadcast Inquiries
            </span>
            <h3 className="text-2xl font-black text-brand-600 mt-1">
              {stats.requests.total}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {stats.requests.active} currently active
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Send className="w-6 h-6" />
          </div>
        </div>

        {/* 4. Reservations / Holds */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              In-Store Holds
            </span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {stats.reservations.total}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {stats.reservations.completed} completed in-store
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Activity Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Broadcast Requests */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-brand-600" />
              Recent Broadcast Requests
            </h3>
          </div>

          <div className="space-y-3">
            {recentRequests.map((req) => (
              <div
                key={req._id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-900">{req.productName}</h4>
                  <p className="text-slate-500">
                    By: {req.customerId?.name || 'Customer'} • Qty: {req.quantity} {req.unit}
                  </p>
                </div>
                <Badge variant={req.status === 'active' ? 'success' : 'neutral'}>
                  {req.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent In-Store Holds */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              Recent Product Holds & Tickets
            </h3>
          </div>

          <div className="space-y-3">
            {recentReservations.map((res) => (
              <div
                key={res._id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800 bg-slate-200/80 px-1.5 py-0.5 rounded text-[10px]">
                      {res.reservationCode}
                    </span>
                    <h4 className="font-bold text-slate-900">{res.productName}</h4>
                  </div>
                  <p className="text-slate-500">
                    Shop: {res.shopId?.shopName || 'Shop'} • Total: ₹{res.totalAmount}
                  </p>
                </div>
                <Badge
                  variant={
                    res.status === 'COMPLETED'
                      ? 'success'
                      : res.status === 'CONFIRMED'
                      ? 'primary'
                      : 'neutral'
                  }
                >
                  {res.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
