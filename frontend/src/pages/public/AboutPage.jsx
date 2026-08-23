import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ShieldCheck, Zap, Heart, MapPin, Users, Award, ShoppingBag, ArrowRight } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
          <Store className="w-3.5 h-3.5" />
          <span>About QuickKart Platform</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Reimagining Local Shopping Through Direct Discovery
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          QuickKart was created as part of the B.Tech Computer Science & Engineering Project Exhibition (2026) to solve a fundamental disconnect in everyday commerce: connecting ready-to-buy customers with neighborhood physical stores that have products in stock right now.
        </p>
      </div>

      {/* Core Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Zero Delivery Delays</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Instead of waiting 24–48 hours for online shipping, discover items available within 15 minutes of your doorstep and collect them immediately.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Strengthening Local Shops</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Unlike monopolistic delivery warehouses, QuickKart directly empowers local small and medium businesses with free, structured digital discovery.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Physical Hold Protection</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Place a guaranteed 60-minute in-store hold without paying upfront. Inspect the genuine product at the counter before completing purchase.
          </p>
        </div>
      </div>

      {/* Project Exhibition Team Credits (Chapter 1) */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Academic Project Exhibition – I
          </span>
          <h2 className="text-2xl font-black">Department of Computer Science & Engineering</h2>
          <p className="text-xs text-slate-400">Supervisor: Dr. Ravi Verma • Reviewers: Dr. Chandan Kumar Behera & Dr. I. Jasmine Selvakumari Jeya</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-center text-xs">
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <p className="font-bold text-white">Shivam Singh</p>
            <p className="text-[11px] text-brand-300">Team Lead & Architect</p>
            <p className="text-[10px] text-slate-400 mt-1">25BCE10736</p>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <p className="font-bold text-white">Krishna Agrawal</p>
            <p className="text-[11px] text-teal-300">Database & Maps</p>
            <p className="text-[10px] text-slate-400 mt-1">25BCE10117</p>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <p className="font-bold text-white">Aryan Singh</p>
            <p className="text-[11px] text-brand-300">Frontend Lead</p>
            <p className="text-[10px] text-slate-400 mt-1">25BCE10798</p>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <p className="font-bold text-white">Atharv Bisht</p>
            <p className="text-[11px] text-emerald-300">Backend & APIs</p>
            <p className="text-[10px] text-slate-400 mt-1">25BCE10596</p>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <p className="font-bold text-white">Subham Kumar</p>
            <p className="text-[11px] text-amber-300">Real-Time & Testing</p>
            <p className="text-[10px] text-slate-400 mt-1">25BCE10413</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-3">
        <Link
          to="/customer/search"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all"
        >
          <span>Start Exploring Local Shops</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
