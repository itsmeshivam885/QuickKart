import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { BarChart3, TrendingUp, ShoppingBag, Send, Store, Users, Download } from 'lucide-react';

export const AdminReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await adminService.getStats();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching admin reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Platform Activity & Audit Reports</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Marketplace Analytics & Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            High-level metrics on customer searches, broadcast conversion rates, and in-store collections.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting full exhibition audit logs CSV...')}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export Audit Report
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Broadcast Conversion Rate
            </span>
            <h3 className="text-3xl font-black text-emerald-600">87.5%</h3>
            <p className="text-xs text-slate-500">
              Proportion of customer broadcast requests that received at least one verified local quote.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Avg. Quote Response Time
            </span>
            <h3 className="text-3xl font-black text-brand-600">~4.2 mins</h3>
            <p className="text-xs text-slate-500">
              Average turnaround time for nearby shopkeepers to submit price & readiness ETA.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              In-Store Hold Pickup Rate
            </span>
            <h3 className="text-3xl font-black text-teal-600">92.0%</h3>
            <p className="text-xs text-slate-500">
              Percentage of 60-minute reservation tickets successfully completed at physical counters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
