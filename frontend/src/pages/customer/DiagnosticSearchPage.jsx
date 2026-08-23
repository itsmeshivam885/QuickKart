import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext';
import { useNotification } from '../../context/NotificationContext';
import { agentService } from '../../services/agentService';
import { ShopCard } from '../../components/customer/ShopCard';
import { ProductCard } from '../../components/customer/ProductCard';
import { ReservationModal } from '../../components/customer/ReservationModal';
import {
  Wrench,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Search,
  Store,
  Package,
  HelpCircle,
} from 'lucide-react';

export const DiagnosticSearchPage = () => {
  const navigate = useNavigate();
  const { coordinates } = useLocation();
  const { addToast } = useNotification();

  const [problem, setProblem] = useState('Water is leaking from the sink pipe joint underneath');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reserveTarget, setReserveTarget] = useState(null);

  const sampleProblems = [
    'Water is leaking from the sink pipe joint underneath',
    'Main ceiling light switch sparking and breaker tripping',
    'Need wall mounting drill machine and fastener kit for heavy mirror',
    'Preparing B.Tech project presentation and technical drawing report',
  ];

  const handleDiagnose = async (e) => {
    if (e) e.preventDefault();
    if (!problem.trim()) return;

    setLoading(true);
    try {
      const res = await agentService.diagnoseProblem({
        problemDescription: problem,
        userLocation: { coordinates },
      });

      if (res.success) {
        setResult(res);
        addToast('🔍 Symptom Analyzed! Found repair diagnosis & specialist shops.', 'success');
      }
    } catch (err) {
      addToast('Failed to run diagnostic search', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Wrench className="w-3.5 h-3.5" />
            <span>Chapter 16.5 • Symptom-Based / Problem Diagnostic Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            “Can You Actually Help Me?”
          </h1>

          <p className="text-xs sm:text-sm text-slate-300">
            Don't worry about knowing the exact part number. Describe the physical problem or symptom in plain words. QuickKart diagnoses the underlying issue and connects you directly with nearby shops equipped to resolve it.
          </p>
        </div>
      </div>

      {/* Symptom Input Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleDiagnose} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Describe Your Physical Issue or Symptom
            </label>
            <div className="relative">
              <input
                type="text"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g. Water is leaking from pipe joint underneath bathroom sink..."
                className="w-full pl-4 pr-32 py-3.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Diagnosing...' : 'Diagnose'}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Try Common Symptoms:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleProblems.map((sample) => (
                <button
                  type="button"
                  key={sample}
                  onClick={() => setProblem(sample)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-medium border border-slate-200 transition-colors text-left"
                >
                  🔧 {sample}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Diagnostic Readout Result */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Analysis Card */}
          <div className="bg-white p-6 rounded-3xl border border-teal-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Diagnostic Assessment</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                {result.diagnosis}
              </h3>
              <p className="text-xs text-slate-600 mt-2 bg-teal-50/80 p-3 rounded-2xl border border-teal-100 leading-relaxed">
                <strong>Recommended Remedy:</strong> {result.recommendedFix}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Required Parts & Materials Identified:
              </span>
              <div className="flex flex-wrap gap-2">
                {result.neededParts.map((part) => (
                  <span
                    key={part}
                    className="bg-slate-100 text-slate-800 px-3 py-1 rounded-xl text-xs font-bold border border-slate-200"
                  >
                    ✓ {part}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Qualified Specialist Shops */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-teal-600" />
              Nearby Specialized Shops for this Issue ({result.nearbySpecialists.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.nearbySpecialists.map((shop) => (
                <ShopCard key={shop._id} shop={shop} />
              ))}
            </div>
          </div>

          {/* Relevant In-Stock Products */}
          {result.suggestedProducts && result.suggestedProducts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-600" />
                In-Stock Replacement Materials ({result.suggestedProducts.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.suggestedProducts.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onReserveClick={(item) => setReserveTarget(item)}
                    onChatClick={() => navigate(`/customer/messages`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reservation Modal */}
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
