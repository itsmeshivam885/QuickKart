import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Badge } from '../../components/common/Badge';
import {
  Package,
  Search,
  RefreshCw,
  Store,
  Tag,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Save,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminProductsPage = () => {
  const [data, setData] = useState({ products: [], totalCount: 0, totalValuation: 0, totalStockUnits: 0 });
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Filters
  const [search, setSearch] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: '',
    shopId: '',
    price: '',
    mrp: '',
    quantityInStock: 50,
    unit: 'piece',
    description: '',
    imageUrl: '',
  });

  // Edit Product Form State
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    mrp: '',
    quantityInStock: '',
    category: '',
    isAvailable: true,
  });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4500);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAdminProducts({
        search: search.trim() || undefined,
        shopId: selectedShopId !== 'ALL' ? selectedShopId : undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        stockStatus: selectedStockStatus !== 'ALL' ? selectedStockStatus : undefined,
      });

      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
      showFeedback('error', 'Failed to fetch catalog data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [shopsRes, catsRes] = await Promise.all([
        adminService.getAllShops(),
        adminService.getCategories(),
      ]);
      if (shopsRes.success) {
        setShops(shopsRes.shops || []);
        if (shopsRes.shops?.length > 0 && !newProduct.shopId) {
          setNewProduct((prev) => ({ ...prev, shopId: shopsRes.shops[0].id || shopsRes.shops[0]._id }));
        }
      }
      if (catsRes.success) {
        setCategories(catsRes.categories || []);
        if (catsRes.categories?.length > 0 && !newProduct.category) {
          setNewProduct((prev) => ({ ...prev, category: catsRes.categories[0].name }));
        }
      }
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(handler);
  }, [search, selectedShopId, selectedCategory, selectedStockStatus]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.shopId) {
      showFeedback('error', 'Please fill in product name, shop, category, and price.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        name: newProduct.name,
        brand: newProduct.brand || 'Generic',
        category: newProduct.category,
        shopId: newProduct.shopId,
        price: parseFloat(newProduct.price),
        mrp: newProduct.mrp ? parseFloat(newProduct.mrp) : parseFloat(newProduct.price),
        quantityInStock: parseInt(newProduct.quantityInStock, 10) || 0,
        unit: newProduct.unit || 'piece',
        description: newProduct.description,
        images: newProduct.imageUrl ? [newProduct.imageUrl] : [
          'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80'
        ],
      };

      const res = await adminService.createAdminProduct(payload);
      if (res.success) {
        showFeedback('success', `Product "${newProduct.name}" added and synced with inventory!`);
        setIsAddModalOpen(false);
        setNewProduct({
          name: '',
          brand: '',
          category: categories[0]?.name || '',
          shopId: shops[0]?.id || shops[0]?._id || '',
          price: '',
          mrp: '',
          quantityInStock: 50,
          unit: 'piece',
          description: '',
          imageUrl: '',
        });
        fetchProducts();
      } else {
        showFeedback('error', res.message || 'Failed to create product.');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      showFeedback('error', err.response?.data?.message || 'Error occurred while saving product.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (prod) => {
    setEditProduct(prod);
    setEditForm({
      name: prod.name || '',
      price: prod.price || '',
      mrp: prod.mrp || prod.price || '',
      quantityInStock: prod.quantityInStock ?? 0,
      category: prod.category || '',
      isAvailable: prod.isAvailable !== false,
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editProduct) return;

    setActionLoading(true);
    try {
      const prodId = editProduct._id || editProduct.id;
      const payload = {
        name: editForm.name,
        price: parseFloat(editForm.price),
        mrp: parseFloat(editForm.mrp),
        quantityInStock: parseInt(editForm.quantityInStock, 10),
        category: editForm.category,
        isAvailable: Boolean(editForm.isAvailable),
      };

      const res = await adminService.updateAdminProduct(prodId, payload);
      if (res.success) {
        showFeedback('success', `Product "${editForm.name}" updated successfully.`);
        setEditProduct(null);
        fetchProducts();
      } else {
        showFeedback('error', res.message || 'Failed to update product.');
      }
    } catch (err) {
      console.error('Update product error:', err);
      showFeedback('error', err.response?.data?.message || 'Failed to update product specifications.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;

    setActionLoading(true);
    try {
      const prodId = deleteConfirmProduct._id || deleteConfirmProduct.id;
      const res = await adminService.deleteAdminProduct(prodId);
      if (res.success) {
        showFeedback('success', `Product "${deleteConfirmProduct.name}" removed from marketplace catalog.`);
        setDeleteConfirmProduct(null);
        fetchProducts();
      } else {
        showFeedback('error', res.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error('Delete product error:', err);
      showFeedback('error', err.response?.data?.message || 'Error deleting product.');
    } finally {
      setActionLoading(false);
    }
  };

  const { products, totalCount, totalValuation, totalStockUnits } = data;
  const lowStockCount = products.filter((p) => p.stockStatus === 'low_stock').length;
  const inStockCount = products.filter((p) => p.stockStatus === 'in_stock').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner / Feedback */}
      {feedback.message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border transition-all animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Package className="w-3.5 h-3.5" />
            <span>Marketplace Catalog & Inventory Audit</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Registered Products & Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track catalog items, store allocations, stock valuations, and inventory health across all sellers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product to Catalog
          </button>
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Refresh Catalog Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Registered Products
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {totalCount} Items
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {inStockCount} actively available
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Inventory Units
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {totalStockUnits} Units
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Across verified stores
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inventory Valuation
            </span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              ₹{Number(totalValuation || 0).toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Gross catalog value
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Stock Alerts
            </span>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {lowStockCount} Items
            </h3>
            <span className="text-[11px] text-amber-700 font-semibold">
              Require replenishment
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Live search by name, brand, tag..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Shop Filter */}
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Stores</option>
            {shops.map((s) => (
              <option key={s.id || s._id} value={s.id || s._id}>
                {s.shopName} ({s.address?.city || 'Local'})
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Status Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'in_stock', label: 'In Stock' },
              { id: 'low_stock', label: 'Low Stock' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStockStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedStockStatus === tab.id
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-20 space-y-2">
          <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading registered products catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or filter criteria, or add a new product directly.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Store & Locality</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price & MRP</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {products.map((p) => {
                  const isLow = p.stockStatus === 'low_stock';
                  const isOut = p.stockStatus === 'out_of_stock';
                  const shopName = p.shopId?.shopName || 'Marketplace Seller';
                  const city = p.shopId?.address?.city || p.shopId?.address?.area || 'Local';

                  return (
                    <tr key={p._id || p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img
                          src={
                            p.images?.[0] ||
                            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=120&q=80'
                          }
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0 bg-slate-50"
                        />
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                            {p.name}
                            {!p.isAvailable && (
                              <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] rounded font-bold">
                                Hidden
                              </span>
                            )}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-normal">
                            Brand: {p.brand || 'Generic'} • Unit: {p.unit || 'piece'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">{shopName}</span>
                          <span className="text-[11px] text-slate-400">{city}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-slate-900">₹{p.price}</span>
                          {p.mrp && p.mrp > p.price && (
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹{p.mrp}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
                            {isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK'}
                          </Badge>
                          <span className="text-[11px] text-slate-500 font-medium block">
                            {p.quantityInStock} units left
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick View */}
                          <button
                            onClick={() => setViewProduct(p)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            title="Quick View / Audit"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Stock & Pricing"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmProduct(p)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
                <Package className="w-5 h-5 text-brand-600" />
                <span>Add Product to Marketplace</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Brown Basmati Rice (1kg)"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Store *</label>
                  <select
                    required
                    value={newProduct.shopId}
                    onChange={(e) => setNewProduct({ ...newProduct, shopId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700"
                  >
                    {shops.map((s) => (
                      <option key={s.id || s._id} value={s.id || s._id}>
                        {s.shopName} ({s.address?.city || 'Local'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category *</label>
                  <select
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold text-slate-700"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Fortune, Amul, Tata"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="piece, kg, pack, liter"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="120"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="140"
                    value={newProduct.mrp}
                    onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    value={newProduct.quantityInStock}
                    onChange={(e) => setNewProduct({ ...newProduct, quantityInStock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Provide concise product specs and packaging details..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <span>Edit Product Details</span>
              </div>
              <button
                onClick={() => setEditProduct(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Store Allocation</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold truncate">
                    {editProduct.shopId?.shopName || 'Assigned Seller'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.mrp}
                    onChange={(e) => setEditForm({ ...editForm, mrp: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={editForm.quantityInStock}
                    onChange={(e) => setEditForm({ ...editForm, quantityInStock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isAvailableCheck"
                  checked={editForm.isAvailable}
                  onChange={(e) => setEditForm({ ...editForm, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="isAvailableCheck" className="text-slate-700 font-bold cursor-pointer select-none">
                  Product Visible to Customers
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK VIEW */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Product Specification Audit
              </span>
              <button
                onClick={() => setViewProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="w-full h-44 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
                <img
                  src={
                    viewProduct.images?.[0] ||
                    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={viewProduct.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">{viewProduct.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {viewProduct.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Price / MRP</span>
                  <span className="text-base font-black text-slate-900">₹{viewProduct.price}</span>
                  {viewProduct.mrp && (
                    <span className="text-slate-400 line-through text-[11px] ml-1.5">
                      ₹{viewProduct.mrp}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Available Stock</span>
                  <span className="text-base font-black text-brand-600">
                    {viewProduct.quantityInStock} {viewProduct.unit || 'units'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Store:</span>
                  <span className="font-bold text-slate-900">
                    {viewProduct.shopId?.shopName || 'Marketplace Seller'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <span className="font-bold text-slate-900">{viewProduct.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Brand:</span>
                  <span className="font-bold text-slate-900">{viewProduct.brand || 'Generic'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Catalog Status:</span>
                  <span
                    className={`font-bold ${
                      viewProduct.isAvailable !== false ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {viewProduct.isAvailable !== false ? 'Active & Discoverable' : 'Hidden from Search'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewProduct(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Remove from Catalog?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete{' '}
                <strong className="text-slate-800">"{deleteConfirmProduct.name}"</strong>? This will remove
                it from all customer discovery feeds and store inventories.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
