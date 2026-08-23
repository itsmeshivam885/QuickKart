import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  ShieldCheck,
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  MapPin,
  Phone,
  User,
  ExternalLink,
} from 'lucide-react';

export const ShopVerificationPage = () => {
  const { addToast } = useNotification();
  const [shops, setShops] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Review modal
  const [selectedShop, setSelectedShop] = useState(null);
  const [actionType, setActionType] = useState('verified');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllShops({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res.success) {
        setShops(res.shops);
      }
    } catch (err) {
      console.error('Error loading shops for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [statusFilter]);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await adminService.verifyShop(selectedShop._id, {
        status: actionType,
        notes,
      });
      if (res.success) {
        addToast(`Store "${selectedShop.shopName}" has been marked as ${actionType}`, 'success');
        setSelectedShop(null);
        setNotes('');
        fetchShops();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update store verification', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Store Onboarding & Trust Verification</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Physical Shop Verification Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review store addresses, owner identity, trade categories, and approve storefronts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {['ALL', 'pending', 'verified', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                  statusFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={fetchShops}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 space-y-2">
          <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading stores...</p>
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Store className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No stores in this queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All newly registered neighborhood stores have been verified.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => {
            const isVerified = shop.verificationStatus === 'verified';
            const isPending = shop.verificationStatus === 'pending';

            return (
              <div
                key={shop._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Image / Header */}
                <div className="h-32 bg-slate-100 relative overflow-hidden">
                  <img
                    src={shop.bannerImage || 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80'}
                    alt={shop.shopName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={
                        isVerified ? 'success' : isPending ? 'warning' : 'danger'
                      }
                    >
                      {shop.verificationStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-bold text-base leading-tight truncate">
                      {shop.shopName}
                    </h4>
                    <span className="text-[11px] text-brand-300 font-semibold">
                      {shop.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3 flex-1 text-xs">
                  <div className="space-y-1 text-slate-600">
                    <p className="flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>
                        {shop.address?.street}, {shop.address?.area}, {shop.address?.city} ({shop.address?.pincode})
                      </span>
                    </p>
                    <p className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Owner: {shop.ownerId?.name} ({shop.ownerId?.email})</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone: {shop.contactPhone}</span>
                    </p>
                  </div>

                  {shop.verificationNotes && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-500 italic">
                      Admin Note: "{shop.verificationNotes}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedShop(shop);
                      setActionType('verified');
                    }}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verify Store
                  </button>

                  <button
                    onClick={() => {
                      setSelectedShop(shop);
                      setActionType('rejected');
                    }}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Modal */}
      {selectedShop && (
        <Modal
          isOpen={!!selectedShop}
          onClose={() => setSelectedShop(null)}
          title={`Confirm ${actionType === 'verified' ? 'Approval' : 'Rejection'}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to mark <strong>{selectedShop.shopName}</strong> as{' '}
              <strong className={actionType === 'verified' ? 'text-emerald-600' : 'text-rose-600'}>
                {actionType}
              </strong>
              ?
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Admin Audit Notes (Optional)
              </label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Physical storefront verified. Trade license valid."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedShop(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                  actionType === 'verified'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                }`}
              >
                {processing ? 'Updating...' : `Confirm ${actionType}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
