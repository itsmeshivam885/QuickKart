import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, Phone, Store, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

export const ShopCard = ({ shop, onBroadcastClick }) => {
  const isOpen = shop.openingHours?.isOpenNow ?? true;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Banner / Header */}
      <div className="h-36 relative overflow-hidden bg-slate-100">
        <img
          src={shop.bannerImage || shop.images?.[0] || 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80'}
          alt={shop.shopName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* Distance Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-brand-600" />
          <span>{shop.distanceKm ? `${shop.distanceKm.toFixed(1)} km` : 'Nearby'}</span>
        </div>

        {/* Verification Status */}
        {shop.verificationStatus === 'verified' && (
          <div className="absolute top-3 left-3 bg-emerald-500/90 text-white backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            Verified Local Shop
          </div>
        )}

        {/* Shop Title overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-black text-lg leading-tight drop-shadow-sm group-hover:text-brand-300 transition-colors">
            {shop.shopName}
          </h3>
          <p className="text-xs text-slate-200 font-medium truncate drop-shadow-sm">
            {shop.tagline || shop.category}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Rating & Category */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 font-bold text-amber-900">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{shop.rating?.toFixed(1) || '4.5'}</span>
            <span className="text-amber-600 font-normal">({shop.reviewCount || 0} reviews)</span>
          </div>

          <Badge variant="primary">{shop.category}</Badge>
        </div>

        {/* Live Business Capability (Chapter 16.4 & Chapter 6) */}
        <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 space-y-1.5 border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Live Status:</span>
            <span className={`font-semibold flex items-center gap-1 ${isOpen ? 'text-emerald-600' : 'text-rose-500'}`}>
              <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>
          {shop.liveState && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Queue / Response:</span>
              <span className="font-semibold text-slate-700">
                ~{shop.liveState.queueTimeMinutes || 5} min • {shop.liveState.responseRatePercent || 95}% rate
              </span>
            </div>
          )}
        </div>

        {/* Top Product preview tags */}
        {shop.topProducts && shop.topProducts.length > 0 && (
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Popular in store:
            </span>
            <div className="flex flex-wrap gap-1">
              {shop.topProducts.map((p) => (
                <span
                  key={p._id}
                  className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium truncate max-w-[150px]"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <Link
            to={`/shops/${shop._id}`}
            className="flex-1 py-2 text-center text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors flex items-center justify-center gap-1"
          >
            <Store className="w-3.5 h-3.5" />
            View Store
          </Link>
          <button
            onClick={() => onBroadcastClick && onBroadcastClick(shop)}
            className="flex-1 py-2 text-center text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Ask Stock
          </button>
        </div>
      </div>
    </div>
  );
};
