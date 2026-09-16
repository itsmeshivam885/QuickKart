import React, { useEffect, useMemo, useState } from 'react';
import { Minus, Package, Plus, Search, ShoppingBag } from 'lucide-react';

const getStockState = (product) => {
  const quantity = Number(product.quantityInStock ?? 0);
  if (quantity <= 0 || product.isAvailable === false) return 'out';
  if (quantity <= 3 || product.stockStatus === 'low_stock') return 'low';
  return 'healthy';
};

const stockLabels = {
  healthy: { label: 'Healthy Stock', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  low: { label: 'Low Stock', className: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  out: { label: 'Out of Stock', className: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
};

const demoStockValues = [30, 20, 45, 60, 25, 35, 18, 50];

const getDemoStockValue = (product, index) => {
  const currentStock = Number(product.quantityInStock ?? product.quantity_in_stock);
  if (Number.isFinite(currentStock) && currentStock > 0) return currentStock;
  const productKey = String(product._id || product.id || product.name || index);
  const keyScore = [...productKey].reduce((total, character) => total + character.charCodeAt(0), 0);
  return demoStockValues[keyScore % demoStockValues.length];
};

export const CustomerInventoryBoard = ({ products = [], shopId, onReserveClick, onChatClick }) => {
  const storageKey = `quickkart_pickup_list_${shopId || 'shop'}`;
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [pickupQuantities, setPickupQuantities] = useState({});
  const [pickupListLoaded, setPickupListLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setPickupQuantities(JSON.parse(saved));
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
    setPickupListLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!pickupListLoaded) return;
    localStorage.setItem(storageKey, JSON.stringify(pickupQuantities));
  }, [pickupListLoaded, pickupQuantities, storageKey]);

  const demoProducts = useMemo(() => products.map((product, index) => ({
    ...product,
    quantityInStock: getDemoStockValue(product, index),
    isAvailable: true,
    stockStatus: getDemoStockValue(product, index) <= 3 ? 'low_stock' : 'in_stock',
  })), [products]);

  const counts = useMemo(() => demoProducts.reduce((result, product) => {
    result[getStockState(product)] += 1;
    return result;
  }, { healthy: 0, low: 0, out: 0 }), [demoProducts]);

  const visibleProducts = demoProducts.filter((product) => {
    const matchesFilter = filter === 'all' || getStockState(product) === filter;
    const searchText = `${product.name || ''} ${product.brand || ''} ${product.category || ''}`.toLowerCase();
    return matchesFilter && searchText.includes(search.toLowerCase());
  });

  const updatePickupQuantity = (product, change) => {
    const stock = Math.max(0, Number(product.quantityInStock ?? 0));
    const current = pickupQuantities[product._id] || 0;
    const next = Math.max(0, Math.min(stock, current + change));
    setPickupQuantities((previous) => {
      const updated = { ...previous };
      if (next === 0) delete updated[product._id];
      else updated[product._id] = next;
      return updated;
    });
  };

  const pickupCount = Object.values(pickupQuantities).reduce((total, quantity) => total + quantity, 0);
  const totalProducts = demoProducts.length || 1;
  const healthWidth = Math.round((counts.healthy / totalProducts) * 100);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <button type="button" onClick={() => setFilter('all')} className={`rounded-xl border px-3 py-2 text-left font-bold ${filter === 'all' ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white border-slate-200 text-slate-500'}`}>
          All Products <span className="text-brand-600">({demoProducts.length})</span>
        </button>
        <button type="button" onClick={() => setFilter('healthy')} className={`rounded-xl border px-3 py-2 text-left font-bold ${filter === 'healthy' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'}`}>
          Healthy <span className="text-emerald-600">({counts.healthy})</span>
        </button>
        <button type="button" onClick={() => setFilter('low')} className={`rounded-xl border px-3 py-2 text-left font-bold ${filter === 'low' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-500'}`}>
          Low Stock <span className="text-amber-600">({counts.low})</span>
        </button>
        <button type="button" onClick={() => setFilter('out')} className={`rounded-xl border px-3 py-2 text-left font-bold ${filter === 'out' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-500'}`}>
          Out of Stock <span className="text-rose-600">({counts.out})</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search items by name or category..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 min-w-52">
          <span className="font-bold whitespace-nowrap">Healthy stock</span>
          <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${healthWidth}%` }} /></div>
          <span className="font-black text-emerald-600">{healthWidth}%</span>
        </div>
      </div>

      {pickupCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-brand-50 border border-brand-200 px-3 py-2 text-xs">
          <span className="font-bold text-brand-800"><ShoppingBag className="w-3.5 h-3.5 inline mr-1" />{pickupCount} item{pickupCount === 1 ? '' : 's'} in your pickup list</span>
          <span className="text-brand-700">Only your requested quantity is saved. Shop stock is unchanged.</span>
        </div>
      )}

      {visibleProducts.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">No products match this inventory view.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleProducts.map((product) => {
            const state = getStockState(product);
            const stock = Number(product.quantityInStock ?? 0);
            const stateMeta = stockLabels[state];
            const pickupQuantity = pickupQuantities[product._id] || 0;
            const isOut = state === 'out';
            return (
              <article key={product._id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=200&q=80'} alt={product.name} className="w-14 h-14 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${stateMeta.className}`}><span className={`w-1.5 h-1.5 rounded-full ${stateMeta.dot}`} />{stateMeta.label}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 truncate">{product.category}</span>
                    </div>
                    <h4 className="font-black text-sm leading-tight text-slate-900 mt-2 line-clamp-2">{product.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Brand: {product.brand || 'Local brand'}</p>
                    <div className="flex items-baseline gap-2 mt-1"><span className="font-black text-slate-900">₹{product.price}</span>{product.mrp > product.price && <span className="text-[10px] text-slate-400 line-through">₹{product.mrp}</span>}<span className="text-[10px] text-slate-400">/ {product.unit}</span></div>
                  </div>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs"><span className="font-bold text-slate-400">Current Stock:</span><span className={`font-black ${isOut ? 'text-rose-600' : state === 'low' ? 'text-amber-600' : 'text-emerald-600'}`}>{stock} {product.unit}</span></div>
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
                    <button type="button" disabled={isOut || pickupQuantity === 0} onClick={() => updatePickupQuantity(product, -1)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-40 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                    <span className="text-xs font-black text-slate-700">{pickupQuantity > 0 ? `${pickupQuantity} for pickup` : 'Add to pickup list'}</span>
                    <button type="button" disabled={isOut || pickupQuantity >= stock} onClick={() => updatePickupQuantity(product, 1)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-40 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button type="button" disabled={isOut} onClick={() => onReserveClick?.(product)} className="flex-1 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[11px] font-black flex items-center justify-center gap-1"><Package className="w-3.5 h-3.5" /> Hold item</button>
                    <button type="button" onClick={() => onChatClick?.(product)} className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black">Chat</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
