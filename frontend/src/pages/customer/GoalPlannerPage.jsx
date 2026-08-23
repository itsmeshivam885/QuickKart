import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { agentService } from '../../services/agentService';
import { Badge } from '../../components/common/Badge';
import {
  Sparkles,
  Bot,
  MapPin,
  Clock,
  IndianRupee,
  Navigation,
  CheckCircle2,
  Layers,
  ShoppingBag,
  Store,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GoalPlannerPage = () => {
  const navigate = useNavigate();
  const { coordinates, addressText, radiusKm } = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const [goalText, setGoalText] = useState(
    'I need a complete plumbing leak repair kit with PVC pipe, valve and sealant under ₹1,200 within 5 km'
  );
  const [budget, setBudget] = useState(1200);
  const [planResult, setPlanResult] = useState(null);
  const [planning, setPlanning] = useState(false);
  const [reserving, setReserving] = useState(false);

  const sampleGoals = [
    'Complete plumbing leak repair kit with PVC pipe, valve & sealant under ₹1,200',
    'Birthday party decoration & lighting setup for 10 people under ₹2,000',
    'Heavy-duty drilling & wall mounting tool kit under ₹3,500',
    'Essential house wiring copper cable, LED bulbs & modular switches under ₹3,000',
  ];

  const handleExecuteAgent = async (e) => {
    if (e) e.preventDefault();
    if (!goalText.trim()) return;

    setPlanning(true);
    try {
      const res = await agentService.planGoal({
        goalText,
        maxBudget: budget,
        maxRadiusKm: radiusKm || 5,
        userLocation: { coordinates },
      });

      if (res.success) {
        setPlanResult(res);
        addToast('⚡ Autonomous Multi-Store Plan Generated!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to generate plan', 'error');
    } finally {
      setPlanning(false);
    }
  };

  const handleReserveEntirePlan = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!planResult?.optimizedRouteStops?.length) return;

    setReserving(true);
    try {
      const res = await agentService.reserveMultiPlan({
        routeStops: planResult.optimizedRouteStops,
      });

      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        addToast(
          `🎉 All ${res.reservations.length} stops reserved! Your multi-shop pickup route is ready.`,
          'success',
          7000
        );
        navigate('/customer/reservations');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reserve plan', 'error');
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chapter 16.1 • Goal-to-Plan Autonomous Local Commerce Agent</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Delegate a Goal, Not a Keyword
          </h1>

          <p className="text-xs sm:text-sm text-slate-300">
            State your overall requirement (e.g. birthday party, bathroom leak, painting). QuickKart autonomously decomposes the task, scans live local inventory across nearby stores, computes the optimal pickup route, and bundles everything into one ready-to-execute plan.
          </p>
        </div>
      </div>

      {/* Goal Input Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleExecuteAgent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              State Your Goal or Requirement
            </label>
            <div className="relative">
              <input
                type="text"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="e.g. I need a birthday decoration setup for 10 people under ₹2,000 within 3 km..."
                className="w-full pl-4 pr-32 py-3.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={planning}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                {planning ? 'Planning...' : 'Generate Plan'}
              </button>
            </div>
          </div>

          {/* Quick sample chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Try Sample Autonomous Goals:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleGoals.map((sample) => (
                <button
                  type="button"
                  key={sample}
                  onClick={() => {
                    setGoalText(sample);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-medium border border-slate-200 transition-colors text-left"
                >
                  ⚡ {sample}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Plan Result Workflow (Fig 16.1) */}
      {planResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Plan Summary Banner */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-brand-500/10 border-2 border-emerald-500/30 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Autonomous Plan Optimized
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {planResult.planSummary.totalItemsCount} items across {planResult.planSummary.uniqueShopsCount} shops
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Total Plan Cost: <span className="text-emerald-700">₹{planResult.planSummary.totalCost}</span>
              </h3>
              <p className="text-xs text-slate-600">
                Total Route Travel: <strong>{planResult.planSummary.totalTravelDistance}</strong> • Est. Trip Time: <strong>{planResult.planSummary.totalEstimatedTripTime}</strong>
              </p>
            </div>

            <button
              onClick={handleReserveEntirePlan}
              disabled={reserving}
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              {reserving ? 'Reserving across shops...' : '1-Click Reserve Entire Plan'}
            </button>
          </div>

          {/* 8-Step Goal-to-Plan Visualization (Fig 16.1) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-600" />
              Multi-Store Optimal Pickup Route (Traveling Salesman Optimization)
            </h3>

            <div className="space-y-4">
              {planResult.optimizedRouteStops.map((stop) => (
                <div
                  key={stop.stopNumber}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                      {stop.stopNumber}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{stop.shopName}</h4>
                        <span className="text-[11px] text-brand-600 font-semibold bg-brand-50 px-2 py-0.5 rounded-md">
                          {stop.distanceFromUser} from your location
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{stop.address}</p>

                      <div className="pt-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                          Items to Collect at this Stop:
                        </span>
                        <div className="space-y-1">
                          {stop.itemsToCollect.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between font-medium"
                            >
                              <span>
                                • {item.name} ({item.quantity} {item.unit})
                              </span>
                              <span className="font-bold text-slate-900">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 sm:self-center">
                    <span className="text-[11px] text-slate-400 font-medium block">
                      Estimated Pickup Time:
                    </span>
                    <span className="text-sm font-black text-slate-800 flex items-center justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {stop.estimatedPickupTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
