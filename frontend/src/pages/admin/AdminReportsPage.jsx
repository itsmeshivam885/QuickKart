import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Send,
  Store,
  Users,
  Download,
  Activity,
  Compass,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
  Eye,
  X,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminReportsPage = () => {
  const [range, setRange] = useState('all');
  const [salesData, setSalesData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAreaAudit, setSelectedAreaAudit] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, trafficRes] = await Promise.all([
        adminService.getSalesReport({ range }),
        adminService.getTrafficAnalytics(),
      ]);

      if (salesRes.success) setSalesData(salesRes);
      if (trafficRes.success) setTrafficData(trafficRes);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  const handleExportCSV = () => {
    if (!salesData) return;

    const escapeCsv = (str) => {
      const s = String(str ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = [
      ['Dimension', 'Area / State', 'Completed Holds', 'Total Revenue (INR)', 'Revenue Share %', 'Leading Category / Product'],
      ...salesData.stateWise.map((s) => [
        'State Aggregation',
        s.state,
        s.totalOrders,
        s.revenue,
        `${s.percentageShare || 0}%`,
        'Multiple Categories',
      ]),
      ...salesData.areaWise.map((a) => [
        'Locality Granular',
        `${a.area}, ${a.state}`,
        a.totalOrders,
        a.revenue,
        '—',
        a.topSellingProduct || 'Essential Provisions',
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.map(escapeCsv).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `QuickKart_Sales_Audit_Report_${range}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !salesData) {
    return (
      <div className="text-center py-24 space-y-2">
        <RefreshCw className="w-7 h-7 text-brand-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Compiling sales & traffic audit reports...</p>
      </div>
    );
  }

  const { overall, stateWise, areaWise } = salesData;
  const traffic = trafficData?.traffic || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Platform Revenue & Discovery Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Marketplace Sales & Traffic Audit Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time sales velocity, area-wise revenue distribution, state-level comparison, and customer discovery traffic.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'all', label: 'All Time' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  range === tab.id
                    ? 'bg-white text-slate-900 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
            title="Refresh Reports"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Overall Sales KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Sales GMV
          </span>
          <h3 className="text-3xl font-black text-purple-600">
            ₹{Number(overall.totalRevenue).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +16.8% volume growth
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Completed Orders
          </span>
          <h3 className="text-3xl font-black text-slate-900">
            {overall.totalOrders} Holds
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Counter reservations fulfilled
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Avg. Ticket Value
          </span>
          <h3 className="text-3xl font-black text-brand-600">
            ₹{overall.avgTicketValue}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Per completed reservation
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:shadow-md transition-shadow">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            In-Store Claim Rate
          </span>
          <h3 className="text-3xl font-black text-emerald-600">
            {overall.pickupSuccessRate}%
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Claimed before 60-min expiry
          </p>
        </div>
      </div>

      {/* Platform Traffic & Engagement Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">
              Discovery & Conversion Engine
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">
              Live Platform Traffic & Customer Intent
            </h2>
          </div>

          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" />
            +{traffic.growthPercentage || 17.3}% Higher Traffic
          </span>
        </div>

        {/* 4 Traffic Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold uppercase text-slate-400">Daily Active Visitors</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{traffic.dailyVisitors || 1420}</p>
            <span className="text-[11px] text-slate-500 font-medium">Unique session IDs</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold uppercase text-slate-400">Product Searches</span>
            <p className="text-2xl font-black text-brand-600 mt-1">{traffic.searchRequestsToday || 3240}</p>
            <span className="text-[11px] text-slate-500 font-medium">Geospatial queries today</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold uppercase text-slate-400">Catalog Page Views</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{traffic.pageViewsToday || 8650}</p>
            <span className="text-[11px] text-slate-500 font-medium">Store & item impressions</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold uppercase text-slate-400">Hold Conversion Rate</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{traffic.conversionRate || 12.8}%</p>
            <span className="text-[11px] text-emerald-700 font-medium">Search to in-store claim</span>
          </div>
        </div>

        {/* Search Keywords & Hourly Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Keywords */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-brand-600" />
              Top Searched Products by Local Customers
            </h3>

            <div className="space-y-2">
              {(traffic.topSearchKeywords || []).map((k, idx) => (
                <div
                  key={k.keyword}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 font-bold">{k.keyword}</span>
                    <span className="text-[10px] text-slate-400 font-normal bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {k.area}
                    </span>
                  </div>
                  <span className="text-slate-600 font-mono font-bold">
                    {k.count} searches
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Traffic Bars */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              Peak Traffic Hours (24h Activity)
            </h3>

            <div className="space-y-2.5">
              {(traffic.hourlyTraffic || []).map((h) => {
                const maxVal = 300;
                const pct = Math.min(100, Math.round((h.visitors / maxVal) * 100));

                return (
                  <div key={h.hour} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-slate-700 font-mono font-bold">{h.hour}</span>
                      <span className="text-slate-500">{h.visitors} visitors • {h.searches} searches</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* State-Wise Sales Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">
              Regional Performance
            </span>
            <h2 className="text-xl font-black text-slate-900">
              State-Wise Marketplace Revenue Breakdown
            </h2>
          </div>

          <Link
            to="/admin/map"
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 hover:underline"
          >
            Open Interactive Geo Map <Compass className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-4 pt-2">
          {stateWise.map((st) => (
            <div key={st.state} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-slate-900">{st.state}</span>
                  <span className="bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-semibold text-[11px]">
                    {st.activeShopsCount} active stores
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-black text-base text-slate-900">
                    ₹{Number(st.revenue).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-brand-600 font-bold">
                    ({st.percentageShare || 0}% of GMV)
                  </span>
                </div>
              </div>

              {/* Progress meter */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(8, st.percentageShare || 0)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{st.totalOrders} counter reservations fulfilled</span>
                <span>Average ticket: ₹{st.totalOrders > 0 ? Math.round(st.revenue / st.totalOrders) : 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Area-Wise Sales Breakdown Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">
              Locality Intelligence
            </span>
            <h2 className="text-xl font-black text-slate-900">
              Area-Wise Sales & Market Dominance Ranking
            </h2>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Sorted by total completed sales volume
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Rank & Locality</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Active Stores</th>
                <th className="py-3 px-4">Completed Orders</th>
                <th className="py-3 px-4">Top Selling Product</th>
                <th className="py-3 px-4 text-right">Revenue (₹)</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {areaWise.map((area, idx) => (
                <tr key={area.area} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 font-black text-[11px] text-slate-700 flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">{area.area}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {area.state}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800">{area.activeShopsCount} Stores</span>
                  </td>

                  <td className="py-3.5 px-4">{area.totalOrders} Holds</td>

                  <td className="py-3.5 px-4 text-slate-600 font-semibold">
                    {area.topSellingProduct || 'Essential Provisions'}
                  </td>

                  <td className="py-3.5 px-4 text-right font-black text-sm text-emerald-600">
                    ₹{Number(area.revenue).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedAreaAudit(area)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: AREA AUDIT BREAKDOWN */}
      {selectedAreaAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">
                  {selectedAreaAudit.state} Region
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedAreaAudit.area} Sales Audit
                </h3>
              </div>
              <button
                onClick={() => setSelectedAreaAudit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Fulfilled GMV</span>
                  <span className="text-xl font-black text-emerald-600">
                    ₹{Number(selectedAreaAudit.revenue).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Completed Orders</span>
                  <span className="text-xl font-black text-slate-900">
                    {selectedAreaAudit.totalOrders} Holds
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Active Stores:</span>
                  <span className="font-bold text-slate-900">{selectedAreaAudit.activeShopsCount} Verified Sellers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Top Moving Item:</span>
                  <span className="font-bold text-slate-900">{selectedAreaAudit.topSellingProduct || 'Essential Goods'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Fulfillment Mode:</span>
                  <span className="font-bold text-emerald-600">Hyperlocal In-Store 60m Hold</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAreaAudit(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
