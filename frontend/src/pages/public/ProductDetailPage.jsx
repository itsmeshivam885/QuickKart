import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext';
import { productService } from '../../services/productService';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { ReservationModal } from '../../components/customer/ReservationModal';
import { Badge } from '../../components/common/Badge';
import {
  Package,
  Store,
  MapPin,
  Star,
  ShieldCheck,
  ShoppingBag,
  MessageSquare,
  Clock,
  Navigation,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { coordinates } = useLocation();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReserveOpen, setIsReserveOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await productService.getProductById(id, {
          lng: coordinates[0],
          lat: coordinates[1],
        });
        if (res.success) {
          setProduct(res.product);
          setSimilarProducts(res.similarProducts || []);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id, coordinates]);

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await chatService.getOrCreateConversation({
        shopId: product.shopId._id || product.shopId,
        productName: product.name,
        price: product.price,
      });
      if (res.success) {
        navigate(`/customer/messages?c=${res.conversation._id}`);
      }
    } catch (err) {
      console.error('Error opening chat:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 space-y-2">
        <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-3">
        <Package className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Product Not Found</h3>
        <Link to="/customer/search" className="text-xs font-bold text-brand-600 hover:underline">
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  const shop = product.shopId;
  const isOutOfStock = product.stockStatus === 'out_of_stock' || product.quantityInStock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Product Primary Detail Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Image (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
            <img
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.stockStatus === 'in_stock' && (
              <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                In Stock ({product.quantityInStock} available)
              </div>
            )}
          </div>
        </div>

        {/* Right: Info & Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {product.brand || 'Generic'}
              </span>
              <span className="text-slate-300">•</span>
              <Badge variant="primary">{product.category}</Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-3xl font-black text-slate-900">
                ₹{product.price}
              </span>
              {product.mrp > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  MRP ₹{product.mrp}
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">per {product.unit}</span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Shop Details Card */}
            {shop && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50/50 to-teal-50/50 border border-brand-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-brand-700 tracking-wider">
                    Available at Physical Store:
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{shop.shopName}</h4>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    {shop.address?.street}, {shop.address?.city}
                  </p>
                </div>

                <Link
                  to={`/shops/${shop._id}`}
                  className="px-3.5 py-2 rounded-xl bg-white border border-brand-200 text-brand-700 font-bold text-xs shadow-xs hover:bg-brand-50 transition-colors"
                >
                  View Store &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleStartChat}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-slate-500" />
              Chat with Store Owner
            </button>

            <button
              onClick={() => setIsReserveOpen(true)}
              disabled={isOutOfStock}
              className={`w-full sm:flex-1 py-3.5 rounded-2xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/25'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Hold & Reserve in Store (60 Mins)
            </button>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={isReserveOpen}
        onClose={() => setIsReserveOpen(false)}
        targetItem={{ ...product, shopId: shop }}
        onSuccess={() => navigate('/customer/reservations')}
      />
    </div>
  );
};
