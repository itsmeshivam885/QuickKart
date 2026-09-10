import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Search,
  RefreshCw,
  UserX,
  UserCheck,
  Shield,
  Store,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Plus,
  Trash2,
  Eye,
  Calendar,
  AlertTriangle,
  Building2,
} from 'lucide-react';

export const UserManagementPage = () => {
  const { addToast } = useNotification();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Add User Form State
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: 'password123',
    street: '',
    area: 'Karol Bagh',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110005',
    shopName: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers({
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  // Live filter on search change
  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.shopName && u.shopName.toLowerCase().includes(q)) ||
      (u.shop?.shopName && u.shop.shopName.toLowerCase().includes(q)) ||
      (u.address?.area && u.address.area.toLowerCase().includes(q)) ||
      (u.address?.city && u.address.city.toLowerCase().includes(q))
    );
  });

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await adminService.toggleUserStatus(id, nextStatus);
      if (res.success) {
        addToast(`User account status changed to ${nextStatus}`, 'info');
        setUsers((prev) =>
          prev.map((u) => (u._id === id || u.id === id ? { ...u, status: nextStatus } : u))
        );
        if (selectedUser && (selectedUser._id === id || selectedUser.id === id)) {
          setSelectedUser((prev) => ({ ...prev, status: nextStatus }));
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user', 'error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) {
      addToast('Name and email are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminService.createAdminUser({
        name: newUserData.name,
        email: newUserData.email,
        password: newUserData.password,
        role: newUserData.role,
        phone: newUserData.phone,
        shopName: newUserData.shopName,
        address: {
          street: newUserData.street,
          area: newUserData.area,
          city: newUserData.city,
          state: newUserData.state,
          pincode: newUserData.pincode,
        },
      });

      if (res.success) {
        addToast(`New ${newUserData.role} "${newUserData.name}" registered successfully!`, 'success');
        setIsAddModalOpen(false);
        setNewUserData({
          name: '',
          email: '',
          phone: '',
          role: 'customer',
          password: 'password123',
          street: '',
          area: 'Karol Bagh',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110005',
          shopName: '',
        });
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setSubmitting(true);
    try {
      const targetId = userToDelete._id || userToDelete.id;
      const res = await adminService.deleteAdminUser(targetId);
      if (res.success) {
        addToast(`User account deleted`, 'info');
        setUsers((prev) => prev.filter((u) => u._id !== targetId && u.id !== targetId));
        setUserToDelete(null);
        if (selectedUser && (selectedUser._id === targetId || selectedUser.id === targetId)) {
          setSelectedUser(null);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // KPI calculations
  const totalUsers = users.length;
  const totalCustomers = users.filter((u) => u.role === 'customer').length;
  const totalShopkeepers = users.filter((u) => u.role === 'shopkeeper').length;
  const totalSuspended = users.filter((u) => u.status === 'suspended').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Registered Directory & Access Controls</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Registered Customers & Shopkeepers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage all platform buyers, verified merchants, linked stores, and operational permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add User / Merchant
          </button>

          <button
            onClick={fetchUsers}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5"
            title="Refresh Users"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalUsers} Users</h3>
            <span className="text-[11px] text-slate-500 font-medium">Full platform directory</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customers</span>
            <h3 className="text-2xl font-black text-brand-600 mt-1">{totalCustomers} Buyers</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Local discovery & broadcast users</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Shopkeepers</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalShopkeepers} Merchants</h3>
            <span className="text-[11px] text-slate-500 font-medium">Physical stores connected</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Suspended</span>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{totalSuspended} Accounts</h3>
            <span className="text-[11px] text-rose-700 font-semibold">Access restricted</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <UserX className="w-6 h-6" />
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
            placeholder="Search by name, email, store, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Role Filter Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {[
              { id: 'ALL', label: 'All Roles' },
              { id: 'customer', label: 'Customers' },
              { id: 'shopkeeper', label: 'Shopkeepers' },
              { id: 'admin', label: 'Admins' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRoleFilter(r.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  roleFilter === r.id ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-600'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-20 space-y-2">
          <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading registered accounts...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching accounts found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or filter selection.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Locality / Connected Shop</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredUsers.map((u) => {
                  const isSuspended = u.status === 'suspended';
                  const isShopkeeper = u.role === 'shopkeeper';

                  return (
                    <tr key={u._id || u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img
                          src={u.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-900">{u.name}</h4>
                          <span className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-300" />
                            {u.email}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`capitalize font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                          u.role === 'customer'
                            ? 'bg-sky-100 text-sky-800'
                            : u.role === 'shopkeeper'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Locality / Connected Shop */}
                      <td className="py-3.5 px-4">
                        {isShopkeeper ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 flex items-center gap-1">
                              <Store className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              {u.shop?.shopName || u.shopName || 'Assigned Store'}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-300" />
                              {u.shop?.area || u.address?.area || 'Central Market'}, {u.shop?.city || u.address?.city || 'Delhi'}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                              {u.address?.area || 'Local Area'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {u.address?.city || 'New Delhi'} ({u.address?.state || 'Delhi'})
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Contact Phone */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-600">
                          {u.phone || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge variant={isSuspended ? 'danger' : 'success'}>
                          {u.status?.toUpperCase() || 'ACTIVE'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details Button */}
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            title="View Account Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Status Button */}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleStatus(u._id || u.id, u.status)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                                isSuspended
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              }`}
                            >
                              {isSuspended ? 'Activate' : 'Suspend'}
                            </button>
                          )}

                          {/* Delete Account Button */}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* 1. Add User / Merchant Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="👤 Register New User / Merchant"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                placeholder="e.g. Alok Nath"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="e.g. alok@noidamart.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Platform Role *
              </label>
              <select
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="customer">Customer (Buyer)</option>
                <option value="shopkeeper">Shopkeeper (Merchant)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Temporary Password
              </label>
              <input
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                placeholder="password123"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {newUserData.role === 'shopkeeper' && (
              <div className="col-span-2 bg-emerald-50 p-3 rounded-xl border border-emerald-100 space-y-1">
                <label className="block font-bold text-emerald-900 uppercase tracking-wider">
                  Connected Store Name
                </label>
                <input
                  type="text"
                  value={newUserData.shopName}
                  onChange={(e) => setNewUserData({ ...newUserData, shopName: e.target.value })}
                  placeholder="e.g. Noida Metro Mart & Hardware"
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <span className="text-[10px] text-emerald-700">
                  This will auto-create and link the verified physical store profile.
                </span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Locality / Area
              </label>
              <input
                type="text"
                value={newUserData.area}
                onChange={(e) => setNewUserData({ ...newUserData, area: e.target.value })}
                placeholder="Karol Bagh, Connaught Place..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                City & State
              </label>
              <input
                type="text"
                value={newUserData.city}
                onChange={(e) => setNewUserData({ ...newUserData, city: e.target.value })}
                placeholder="New Delhi, Noida, Mumbai..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20"
            >
              {submitting ? 'Creating...' : 'Register User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. View User Dossier Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`📋 User Dossier: ${selectedUser.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <img
                src={selectedUser.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                alt={selectedUser.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">{selectedUser.name}</h3>
                <p className="text-slate-500">{selectedUser.email}</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="capitalize font-bold px-2 py-0.5 rounded-full text-[10px] bg-brand-100 text-brand-800">
                    {selectedUser.role}
                  </span>
                  <Badge variant={selectedUser.status === 'active' ? 'success' : 'danger'}>
                    {selectedUser.status?.toUpperCase() || 'ACTIVE'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold">Contact Phone:</span>
                <span className="font-mono">{selectedUser.phone || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold">Locality / City:</span>
                <span>{selectedUser.address?.area || 'Central'}, {selectedUser.address?.city || 'Delhi'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold">Full Address:</span>
                <span className="text-right truncate max-w-[200px]">{selectedUser.address?.street || 'Main Street'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-bold">Registration Date:</span>
                <span>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN') : 'Recent'}</span>
              </div>
            </div>

            {selectedUser.role === 'shopkeeper' && (
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Connected Store
                </span>
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Store className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{selectedUser.shop?.shopName || selectedUser.shopName || 'Assigned Store Profile'}</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  {selectedUser.shop?.area || selectedUser.address?.area || 'Local Area'}, {selectedUser.shop?.city || selectedUser.address?.city || 'New Delhi'}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {selectedUser.role !== 'admin' && (
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedUser._id || selectedUser.id, selectedUser.status)}
                  className={`px-3 py-1.5 rounded-xl font-bold ${
                    selectedUser.status === 'suspended'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {selectedUser.status === 'suspended' ? 'Reactivate Account' : 'Suspend Access'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. Delete Confirmation Modal */}
      {userToDelete && (
        <Modal
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          title="⚠️ Confirm Account Removal"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to permanently delete <strong>{userToDelete.name}</strong> ({userToDelete.email}) from the platform?
            </p>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-rose-800 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>
                This will revoke their login sessions and unlink any connected store or customer hold reservations.
              </span>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteUser}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-500/20"
              >
                {submitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
