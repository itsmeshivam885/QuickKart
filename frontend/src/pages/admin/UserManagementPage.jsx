import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../../components/common/Badge';
import { Users, Search, RefreshCw, UserX, UserCheck, Shield } from 'lucide-react';

export const UserManagementPage = () => {
  const { addToast } = useNotification();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers({
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        search: search || undefined,
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
  }, [roleFilter]);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await adminService.toggleUserStatus(id, nextStatus);
      if (res.success) {
        addToast(`User status changed to ${nextStatus}`, 'info');
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>User Accounts & Security</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Platform Users & Roles Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage Customers, Shopkeepers, and Platform Admins with RBAC controls.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchUsers();
          }}
          className="relative w-full sm:w-80"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {['ALL', 'customer', 'shopkeeper', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                roleFilter === r ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-20 space-y-2">
          <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading accounts...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.map((u) => {
                  const isSuspended = u.status === 'suspended';

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img
                          src={u.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900">{u.name}</h4>
                          <span className="text-[11px] text-slate-400 font-normal">{u.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="capitalize font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px]">
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">{u.phone || '—'}</td>

                      <td className="py-3.5 px-4">
                        <Badge variant={isSuspended ? 'danger' : 'success'}>
                          {u.status.toUpperCase()}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u._id, u.status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              isSuspended
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            {isSuspended ? 'Activate User' : 'Suspend User'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
