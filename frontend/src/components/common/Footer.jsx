import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Zap, Store, MapPin, Sparkles, Wrench } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.jpg"
                alt="QuickKart"
                className="w-8 h-8 rounded-lg object-contain"
              />
              <span className="text-xl font-bold text-white tracking-tight">
                Quick<span className="text-brand-400">Kart</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Find Nearby. Compare Prices. Buy Quickly." Empowering neighborhood stores with hyper-local digital visibility.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Hyperlocal Commerce
            </div>
          </div>

          {/* Shoppers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              For Shoppers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/customer/search" className="hover:text-white transition-colors">
                  Explore Nearby Stores
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  Live Stock Catalog
                </Link>
              </li>
              <li>
                <Link to="/customer/goal-planner" className="hover:text-brand-300 text-brand-400 font-bold transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Goal Agent
                </Link>
              </li>
              <li>
                <Link to="/customer/diagnostics" className="hover:text-white transition-colors flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-teal-400" />
                  Diagnostic Search
                </Link>
              </li>
              <li>
                <Link to="/customer/reservations" className="hover:text-white transition-colors">
                  In-Store Hold Tickets
                </Link>
              </li>
            </ul>
          </div>

          {/* For Shopkeepers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              For Local Merchants
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Register Your Store
                </Link>
              </li>
              <li>
                <Link to="/shop/dashboard" className="hover:text-white transition-colors">
                  Shopkeeper Hub
                </Link>
              </li>
              <li>
                <Link to="/shop/products" className="hover:text-white transition-colors">
                  Inventory & Barcodes
                </Link>
              </li>
              <li>
                <Link to="/shop/requests" className="hover:text-white transition-colors">
                  Customer Quotes Feed
                </Link>
              </li>
              <li>
                <Link to="/shop/reservations" className="hover:text-white transition-colors">
                  Counter Hold Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin & Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Platform & Info
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About QuickKart
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-white transition-colors">
                  Admin Analytics Hub
                </Link>
              </li>
              <li>
                <Link to="/admin/shops" className="hover:text-white transition-colors">
                  Shop Verification Queue
                </Link>
              </li>
              <li>
                <Link to="/admin/reports" className="hover:text-white transition-colors">
                  Exhibition Audit Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Capstone Exhibition Info */}
          <div className="space-y-2 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Project Exhibition – I
            </h4>
            <p className="text-slate-400">
              Department of Computer Science & Engineering, 2026.
            </p>
            <p className="text-slate-500 text-[11px]">
              Supervisor: Dr. Ravi Verma
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              MERN Stack • Socket.IO • Leaflet Maps • JWT RBAC
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 QuickKart Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-300">About</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-300">Contact</Link>
            <span>•</span>
            <Link to="/shops" className="hover:text-slate-300">Shops Directory</Link>
            <span>•</span>
            <Link to="/products" className="hover:text-slate-300">Products</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
