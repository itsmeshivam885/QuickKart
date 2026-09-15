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
  Power,
  Package,
  ShoppingBag,
  Star,
  Search,
  Plus,
  Trash2,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export const ShopVerificationPage = () => {
  const { addToast } = useNotification();
  const [shops, setShops] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedShopForDecision, setSelectedShopForDecision] = useState(null);
  const [selectedShopForView, setSelectedShopForView] = useState(null);
  const [shopToDelete, setShopToDelete] = useState(null);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);

  const [actionType, setActionType] = useState('verified');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // New Store Form State
  const [newShopData, setNewShopData] = useState({
    shopName: '',
    category: 'Hardware & Tools',
    ownerName: '',
    contactPhone: '',
    street: '',
    area: 'Karol Bagh',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110005',
    lat: '28.6517',
    lng: '77.1906',
    bannerImage: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80',
  });

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllShops({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        active: activeFilter !== 'ALL' ? activeFilter : undefined,
        search: search.trim() || undefined,
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
  }, [statusFilter, activeFilter]);

  // Live filter on search change
  const filteredShops = shops.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.shopName && s.shopName.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q)) ||
      (s.address?.area && s.address.area.toLowerCase().includes(q)) ||
      (s.address?.city && s.address.city.toLowerCase().includes(q)) ||
      (s.address?.state && s.address.state.toLowerCase().includes(q)) ||
      (s.ownerId?.name && s.ownerId.name.toLowerCase().includes(q)) ||
      (s.ownerName && s.ownerName.toLowerCase().includes(q))
    );
  });

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedShopForDecision) return;
    setProcessing(true);
    try {
      const targetId = selectedShopForDecision._id || selectedShopForDecision.id;
      const res = await adminService.verifyShop(targetId, {
        status: actionType,
        notes,
      });
      if (res.success) {
        addToast(`Store "${selectedShopForDecision.shopName}" has been marked as ${actionType}`, 'success');
        setSelectedShopForDecision(null);
        setNotes('');
        fetchShops();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update store verification', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleActive = async (shop) => {
    const nextState = !(shop.isActive !== false);
    try {
      const targetId = shop._id || shop.id;
      const res = await adminService.toggleShopStatus(targetId, nextState);
      if (res.success) {
        addToast(`"${shop.shopName}" is now ${nextState ? 'Active' : 'Offline'}`, 'info');
        setShops((prev) =>
          prev.map((s) => (s._id === targetId || s.id === targetId ? { ...s, isActive: nextState } : s))
        );
        if (selectedShopForView && (selectedShopForView._id === targetId || selectedShopForView.id === targetId)) {
          setSelectedShopForView((prev) => ({ ...prev, isActive: nextState }));
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update store status', 'error');
    }
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!newShopData.shopName || !newShopData.category) {
      addToast('Store name and category are required', 'error');
      return;
    }

    setProcessing(true);
    try {
      const res = await adminService.createAdminShop({
        shopName: newShopData.shopName,
        category: newShopData.category,
        ownerName: newShopData.ownerName,
        contactPhone: newShopData.contactPhone,
        address: {
          street: newShopData.street,
          area: newShopData.area,
          city: newShopData.city,
          state: newShopData.state,
          pincode: newShopData.pincode,
        },
        coordinates: [parseFloat(newShopData.lng) || 77.1906, parseFloat(newShopData.lat) || 28.6517],
        bannerImage: newShopData.bannerImage,
      });

      if (res.success) {
        addToast(`Store "${newShopData.shopName}" registered & verified successfully!`, 'success');
        setIsAddShopModalOpen(false);
        setNewShopData({
          shopName: '',
          category: 'Hardware & Tools',
          ownerName: '',
          contactPhone: '',
          street: '',
          area: 'Karol Bagh',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110005',
          lat: '28.6517',
          lng: '77.1906',
          bannerImage: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80',
        });
        fetchShops();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to register store', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteShop = async () => {
    if (!shopToDelete) return;
    setProcessing(true);
    try {
      const targetId = shopToDelete._id || shopToDelete.id;
      const res = await adminService.deleteAdminShop(targetId);
      if (res.success) {
        addToast(`Store removed from platform`, 'info');
        setShops((prev) => prev.filter((s) => s._id !== targetId && s.id !== targetId));
        setShopToDelete(null);
        if (selectedShopForView && (selectedShopForView._id === targetId || selectedShopForView.id === targetId)) {
          setSelectedShopForView(null);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete store', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Counts
  const totalShops = shops.length;
  const activeShopsCount = shops.filter((s) => s.isActive !== false).length;
  const verifiedShopsCount = shops.filter((s) => s.verificationStatus === 'verified').length;
  const pendingShopsCount = shops.filter((s) => s.verificationStatus === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Merchant Trust & Operational Onboarding</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Physical Store Verification & Active Status
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review store trade categories, physical locations on Google Maps, and manage active platform availability.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddShopModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Onboard New Store
          </button>

          <button
            onClick={fetchShops}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5"
            title="Refresh Stores"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Stores</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalShops} Stores</h3>
            <span className="text-[11px] text-slate-500 font-medium">Across all regional zones</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Stores</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeShopsCount} Live</h3>
            <span className="text-[11px] text-emerald-700 font-semibold">Available for nearby discovery</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Power className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Stores</span>
            <h3 className="text-2xl font-black text-brand-600 mt-1">{verifiedShopsCount} Stores</h3>
            <span className="text-[11px] text-brand-700 font-semibold">Address & license audited</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingShopsCount} Queue</h3>
            <span className="text-[11px] text-amber-700 font-semibold">Awaiting admin sign-off</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search store name, locality, or merchant..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Verification Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {['ALL', 'pending', 'verified', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                  statusFilter === s ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Active Operational Filter */}
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Operational States</option>
            <option value="true">Active Stores Only</option>
            <option value="false">Offline Stores Only</option>
          </select>
        </div>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="text-center py-20 space-y-2">
          <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading stores...</p>
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Store className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No stores match criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or operational filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => {
            const isVerified = shop.verificationStatus === 'verified';
            const isPending = shop.verificationStatus === 'pending';
            const isShopActive = shop.isActive !== false;

            const lat = shop.location?.coordinates?.[1] || 28.6517;
            const lng = shop.location?.coordinates?.[0] || 77.1906;

            return (
              <div
                key={shop._id || shop.id}
                className={`bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col justify-between transition-all ${
                  !isShopActive ? 'border-slate-300 opacity-90' : 'border-slate-200 hover:shadow-md'
                }`}
              >
                {/* Image Banner & Badges */}
                <div className="h-36 bg-slate-100 relative overflow-hidden">
                  <img
                    src={shop.bannerImage || 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80'}
                    alt={shop.shopName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isShopActive ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-700 text-slate-200'
                    }`}>
                      {isShopActive ? '● Live Store' : '○ Offline'}
                    </span>

                    <Badge
                      variant={isVerified ? 'success' : isPending ? 'warning' : 'danger'}
                    >
                      {shop.verificationStatus?.toUpperCase() || 'VERIFIED'}
                    </Badge>
                  </div>

                  {/* Title on Banner */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-black text-base leading-tight truncate">
                      {shop.shopName}
                    </h4>
                    <span className="text-[11px] text-brand-300 font-semibold block mt-0.5">
                      {shop.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3 flex-1 text-xs">
                  <div className="space-y-1.5 text-slate-600">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>
                        {shop.address?.street}, {shop.address?.area}, {shop.address?.city} ({shop.address?.state || 'Delhi'})
                      </span>
                    </p>

                    <p className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Owner: {shop.ownerId?.name || shop.ownerName || 'Merchant'}</span>
                    </p>

                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone: {shop.contactPhone || '—'}</span>
                    </p>
                  </div>

                  {/* Metrics Row */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold">Catalog Items</span>
                      <span className="font-black text-slate-800">{shop.totalProductsCount || 0} Products</span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold">Est. Sales Volume</span>
                      <span className="font-black text-emerald-600">₹{Number(shop.totalSalesVolume || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-800 font-bold flex items-center gap-1 hover:underline text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Verify on Google Maps
                    </a>

                    <span className="text-slate-400 text-[11px] font-medium flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {shop.rating || 4.5} rating
                    </span>
                  </div>

                  {shop.verificationNotes && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-500 italic text-[11px]">
                      Admin Audit Note: "{shop.verificationNotes}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  {/* Quick View Button */}
                  <button
                    onClick={() => setSelectedShopForView(shop)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-200 font-bold"
                    title="View Store Overview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle Active Button */}
                  <button
                    onClick={() => handleToggleActive(shop)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-1 transition-all ${
                      isShopActive
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                    title={isShopActive ? 'Deactivate store from customer search' : 'Activate store'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {isShopActive ? 'Deactivate' : 'Activate'}
                  </button>

                  {/* Verification Actions */}
                  {isPending ? (
                    <>
                      <button
                        onClick={() => {
                          setSelectedShopForDecision(shop);
                          setActionType('verified');
                        }}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>

                      <button
                        onClick={() => {
                          setSelectedShopForDecision(shop);
                          setActionType('rejected');
                        }}
                        className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedShopForDecision(shop);
                        setActionType(isVerified ? 'rejected' : 'verified');
                      }}
                      className="flex-1 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center"
                    >
                      {isVerified ? 'Revoke Approval' : 'Re-verify Store'}
                    </button>
                  )}

                  {/* Delete Store Button */}
                  <button
                    onClick={() => setShopToDelete(shop)}
                    className="p-2 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700 font-bold"
                    title="Deregister Store"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Onboard New Store Modal */}
      <Modal
        isOpen={isAddShopModalOpen}
        onClose={() => setIsAddShopModalOpen(false)}
        title="🏬 Onboard Physical Store"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateShop} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={newShopData.shopName}
                onChange={(e) => setNewShopData({ ...newShopData, shopName: e.target.value })}
                placeholder="e.g. Metro Electricals & Smart Provisions"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Trade Category *
              </label>
              <select
                value={newShopData.category}
                onChange={(e) => setNewShopData({ ...newShopData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="Hardware & Tools">Hardware & Tools</option>
                <option value="Plumbing & Sanitary">Plumbing & Sanitary</option>
                <option value="Electrical & Lighting">Electrical & Lighting</option>
                <option value="Groceries & Daily Essentials">Groceries & Daily Essentials</option>
                <option value="Stationery & Office">Stationery & Office</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Owner / Merchant Name
              </label>
              <input
                type="text"
                value={newShopData.ownerName}
                onChange={(e) => setNewShopData({ ...newShopData, ownerName: e.target.value })}
                placeholder="e.g. Suresh Patel"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={newShopData.contactPhone}
                onChange={(e) => setNewShopData({ ...newShopData, contactPhone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Locality / Area *
              </label>
              <input
                type="text"
                required
                value={newShopData.area}
                onChange={(e) => setNewShopData({ ...newShopData, area: e.target.value })}
                placeholder="Karol Bagh, Noida, Bandra..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={newShopData.street}
                onChange={(e) => setNewShopData({ ...newShopData, street: e.target.value })}
                placeholder="Shop 12, Ground Floor, Central Market"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                City
              </label>
              <input
                type="text"
                value={newShopData.city}
                onChange={(e) => setNewShopData({ ...newShopData, city: e.target.value })}
                placeholder="New Delhi, Mumbai..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                value={newShopData.state}
                onChange={(e) => setNewShopData({ ...newShopData, state: e.target.value })}
                placeholder="Delhi, Uttar Pradesh, Maharashtra..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Latitude (Google Maps)
              </label>
              <input
                type="text"
                value={newShopData.lat}
                onChange={(e) => setNewShopData({ ...newShopData, lat: e.target.value })}
                placeholder="28.6517"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Longitude (Google Maps)
              </label>
              <input
                type="text"
                value={newShopData.lng}
                onChange={(e) => setNewShopData({ ...newShopData, lng: e.target.value })}
                placeholder="77.1906"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddShopModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20"
            >
              {processing ? 'Onboarding...' : 'Onboard Store'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. View Store Overview Modal */}
      {selectedShopForView && (
        <Modal
          isOpen={!!selectedShopForView}
          onClose={() => setSelectedShopForView(null)}
          title={`🏬 Store Overview: ${selectedShopForView.shopName}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="h-32 bg-slate-100 rounded-2xl overflow-hidden relative">
              <img
                src={selectedShopForView.bannerImage || 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80'}
                alt={selectedShopForView.shopName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="font-black text-base leading-tight">{selectedShopForView.shopName}</h4>
                <p className="text-[11px] text-brand-300 font-semibold">{selectedShopForView.category}</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold">Operational Status:</span>
                <span className={selectedShopForView.isActive !== false ? 'text-emerald-600 font-bold' : 'text-slate-500 font-bold'}>
                  {selectedShopForView.isActive !== false ? '● Live & Active' : '○ Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold">Verification:</span>
                <Badge variant={selectedShopForView.verificationStatus === 'verified' ? 'success' : 'warning'}>
                  {selectedShopForView.verificationStatus?.toUpperCase() || 'VERIFIED'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold">Owner / Contact:</span>
                <span>{selectedShopForView.ownerId?.name || selectedShopForView.ownerName || 'Merchant'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold">Phone:</span>
                <span className="font-mono">{selectedShopForView.contactPhone || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold">Address:</span>
                <span className="truncate max-w-[200px]">
                  {selectedShopForView.address?.street}, {selectedShopForView.address?.area}, {selectedShopForView.address?.city}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold">Estimated Sales:</span>
                <span className="text-emerald-600 font-black text-sm">
                  ₹{Number(selectedShopForView.totalSalesVolume || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedShopForView.location?.coordinates?.[1] || 28.6517},${selectedShopForView.location?.coordinates?.[0] || 77.1906}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 font-bold hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View on Google Maps
              </a>

              <button
                type="button"
                onClick={() => setSelectedShopForView(null)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. Decision Modal (Approve / Reject / Revoke) */}
      {selectedShopForDecision && (
        <Modal
          isOpen={!!selectedShopForDecision}
          onClose={() => setSelectedShopForDecision(null)}
          title={`Confirm Store ${actionType === 'verified' ? 'Approval' : 'Revocation'}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to mark <strong>{selectedShopForDecision.shopName}</strong> as{' '}
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
                placeholder="e.g. Physical storefront verified on Google Maps. Trade license verified."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedShopForDecision(null)}
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

      {/* 4. Delete Store Modal */}
      {shopToDelete && (
        <Modal
          isOpen={!!shopToDelete}
          onClose={() => setShopToDelete(null)}
          title="⚠️ Confirm Store Deregistration"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to remove <strong>{shopToDelete.shopName}</strong> from the QuickKart marketplace?
            </p>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-rose-800 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>
                This store will be completely delisted from the map, regional sales reports, and customer search.
              </span>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShopToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleDeleteShop}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-500/20"
              >
                {processing ? 'Removing...' : 'Confirm Deregistration'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
