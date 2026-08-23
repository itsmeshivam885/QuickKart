import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShoppingBag, Store, MessageSquare, Check, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

export const ProductCard = ({ product, onReserveClick, onChatClick }) => {
  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const isLowStock = product.stockStatus === 'low_stock';
  const isOutOfStock = product.stockStatus === 'out_of_stock' || product.quantityInStock <= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Product Image */}
      <div className="h-44 relative bg-slate-100 overflow-hidden">
        <img
          src={
            product.images?.[0] ||
            'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80'
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Tag */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        {/* Stock Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <Badge variant="danger">Out of Stock</Badge>
          ) : isLowStock ? (
            <Badge variant="warning">Only {product.quantityInStock} Left</Badge>
          ) : (
            <Badge variant="success">In Stock</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>{product.brand}</span>
            <span className="text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
          </div>

          <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h4>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-black text-slate-900">
              ₹{product.price}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{product.mrp}
              </span>
            )}
            <span className="text-xs text-slate-500">/ {product.unit}</span>
          </div>
        </div>

        {/* Shop Info Footer */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {product.shopId && (
            <div className="flex items-center justify-between text-xs">
              <Link
                to={`/shops/${product.shopId._id || product.shopId}`}
                className="font-semibold text-slate-700 hover:text-brand-600 truncate flex items-center gap-1"
              >
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{product.shopId.shopName || 'Local Shop'}</span>
              </Link>
              {product.distanceKm !== undefined && (
                <span className="text-brand-600 font-bold text-[11px] flex-shrink-0 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {product.distanceKm < 1
                    ? `${Math.round(product.distanceKm * 1000)} m`
                    : `${product.distanceKm.toFixed(1)} km`}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onChatClick && onChatClick(product)}
              className="p-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              title="Chat with shopkeeper"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReserveClick && onReserveClick(product)}
              disabled={isOutOfStock}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Hold & Reserve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
