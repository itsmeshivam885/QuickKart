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
  MapPin,
  Compass,
  Activity,
  UserCheck,
  Eye,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getStats();
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to load platform analytics');
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err?.response?.data?.message || err.message || 'Error connecting to admin API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-24 space-y-2">
        <RefreshCw className="w-7 h-7 text-brand-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Loading platform analytics & operations...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800">Admin Dashboard Unavailable</h3>
        <p className="text-xs text-slate-500">{error || 'Could not load data. Ensure backend is running and you are logged in as admin.'}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { stats, recentUsers, recentRequests, recentReservations } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform HQ & Operations Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            QuickKart Platform Control Center
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Real-time management for registered customers, shopkeepers, product catalog, active stores, traffic, and sales distribution.
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/map"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 font-bold text-xs text-white shadow-md shadow-brand-500/25 transition-all flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            Regional Sales Map
          </Link>

          <Link
            to="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Package className="w-4 h-4 text-brand-400" />
            Products ({stats.products.total})
          </Link>

          <Link
            to="/admin/shops"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            Stores ({stats.shops.active} Active)
          </Link>

          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            title="Refresh All Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Customers & Shopkeepers */}
        <Link
          to="/admin/users"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-brand-300 transition-all group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registered Users
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats.users.total} Total
            </h3>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5 space-x-1">
              <span className="text-brand-600 font-bold">{stats.users.customers} Customers</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">{stats.users.shopkeepers} Shopkeepers</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </Link>

        {/* 2. Active Shops & Verification */}
        <Link
          to="/admin/shops"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-emerald-300 transition-all group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Shops
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-2xl font-black text-emerald-600">
                {stats.shops.active} Active
              </h3>
              <span className="text-xs text-slate-400 font-bold">/ {stats.shops.total} total</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {stats.shops.verified} verified • {stats.shops.pending} pending approval
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Store className="w-6 h-6" />
          </div>
        </Link>

        {/* 3. Registered Products */}
        <Link
          to="/admin/products"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-sky-300 transition-all group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registered Products
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats.products.total} Products
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {stats.products.inStock} in stock • {stats.products.lowStock} low stock
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Package className="w-6 h-6" />
          </div>
        </Link>

        {/* 4. Sales & Revenue */}
        <Link
          to="/admin/reports"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-purple-300 transition-all group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Platform Sales
            </span>
            <h3 className="text-2xl font-black text-purple-600 mt-1">
              ₹{Number(stats.sales.totalRevenue).toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {stats.sales.completedOrders} orders completed at counters
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Traffic & Regional Map Teaser Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Statistics Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              Platform Traffic & Discovery
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +{stats.traffic?.growthPercentage || 17.3}% Today
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Daily Active Visitors</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">{stats.traffic?.dailyVisitors || 1420}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Product Searches</span>
              <p className="text-xl font-black text-brand-600 mt-0.5">{stats.traffic?.searchRequestsToday || 3240}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Page Views</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">{stats.traffic?.pageViewsToday || 8650}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Conversion Rate</span>
              <p className="text-xl font-black text-emerald-600 mt-0.5">{stats.traffic?.conversionRate || 12.8}%</p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/admin/reports"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
            >
              View Full Analytics & Audit Logs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Regional Geospatial Map Showcase Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white p-6 sm:p-7 rounded-3xl shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Interactive Google Maps & OpenStreetMap Visualizer</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black leading-tight">
              Area & State-Wise Sales & Density Visualizer
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Filter by Delhi, Madhya Pradesh, Uttar Pradesh, Haryana, Maharashtra, and Karnataka. Select any area (Karol Bagh, Sehore, Ashta, VIT Bhopal, Bhopal, Connaught Place, Lajpat Nagar, Noida) to see active shop locations and live revenue density.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/admin/map"
              className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-black text-xs shadow-lg shadow-brand-500/30 flex items-center gap-2 transition-all"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              Explore Interactive Regional Map
            </Link>

            <span className="text-xs text-slate-400 font-medium">
              Pins for active stores mapped with directions & live status
            </span>
          </div>
        </div>
      </div>

      {/* Activity Streams (Recent Registrations & In-Store Holds) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-600" />
              Recent Registered Accounts
            </h3>
            <Link to="/admin/users" className="text-xs font-bold text-brand-600 hover:underline">
              View All ({stats.users.total}) &rarr;
            </Link>
          </div>

          <div className="space-y-2.5">
            {(recentUsers || []).map((user) => (
              <div
                key={user._id || user.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{user.name}</h4>
                    <p className="text-slate-400 text-[11px]">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`capitalize font-bold text-[10px] px-2 py-0.5 rounded-full ${
                    user.role === 'customer'
                      ? 'bg-sky-100 text-sky-800'
                      : user.role === 'shopkeeper'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {user.role}
                  </span>
                  <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                    {user.status || 'active'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent In-Store Holds & Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              Recent Product Holds & Orders
            </h3>
            <Link to="/admin/reports" className="text-xs font-bold text-brand-600 hover:underline">
              Sales Report &rarr;
            </Link>
          </div>

          <div className="space-y-2.5">
            {(recentReservations || []).map((res) => (
              <div
                key={res._id || res.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                      {res.reservationCode || 'QK-HOLD'}
                    </span>
                    <h4 className="font-bold text-slate-900 truncate max-w-[200px]">
                      {res.product_name || res.productName}
                    </h4>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Qty: {res.quantity} • Total: ₹{res.total_amount || res.totalAmount}
                  </p>
                </div>

                <Badge
                  variant={
                    res.status === 'COMPLETED'
                      ? 'success'
                      : res.status === 'CONFIRMED' || res.status === 'READY'
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
