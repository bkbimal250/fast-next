'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, User, Permission } from '@/lib/user';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { FaShieldAlt, FaCheckCircle, FaTimesCircle, FaUsers, FaUserShield, FaUserTie, FaUser, FaEdit, FaEye } from 'react-icons/fa';

interface RolePermissions {
  role: string;
  permissions: {
    can_post_jobs: boolean;
    can_post_free_jobs: boolean;
    can_post_premium_jobs: boolean;
    can_create_spa: boolean;
    can_edit_spa: boolean;
    can_manage_users: boolean;
    can_manage_all_jobs: boolean;
    can_manage_all_spas: boolean;
  };
}

const ROLE_PERMISSIONS: Record<string, RolePermissions['permissions']> = {
  admin: {
    can_post_jobs: true,
    can_post_free_jobs: true,
    can_post_premium_jobs: true,
    can_create_spa: true,
    can_edit_spa: true,
    can_manage_users: true,
    can_manage_all_jobs: true,
    can_manage_all_spas: true,
  },
  manager: {
    can_post_jobs: true,
    can_post_free_jobs: true,
    can_post_premium_jobs: true,
    can_create_spa: true,
    can_edit_spa: true,
    can_manage_users: false,
    can_manage_all_jobs: false,
    can_manage_all_spas: false,
  },
  recruiter: {
    can_post_jobs: false,
    can_post_free_jobs: false,
    can_post_premium_jobs: false,
    can_create_spa: false,
    can_edit_spa: true,
    can_manage_users: false,
    can_manage_all_jobs: false,
    can_manage_all_spas: false,
  },
  user: {
    can_post_jobs: false,
    can_post_free_jobs: false,
    can_post_premium_jobs: false,
    can_create_spa: false,
    can_edit_spa: false,
    can_manage_users: false,
    can_manage_all_jobs: false,
    can_manage_all_spas: false,
  },
};

const PERMISSION_LABELS: Record<keyof RolePermissions['permissions'], string> = {
  can_post_jobs: 'Post Jobs',
  can_post_free_jobs: 'Post Free Jobs',
  can_post_premium_jobs: 'Post Premium Jobs',
  can_create_spa: 'Create SPA',
  can_edit_spa: 'Edit SPA',
  can_manage_users: 'Manage Users',
  can_manage_all_jobs: 'Manage All Jobs',
  can_manage_all_spas: 'Manage All SPAs',
};

const ROLE_ICONS = {
  admin: FaUserShield,
  manager: FaUserTie,
  recruiter: FaUsers,
  user: FaUser,
};

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  manager: 'bg-blue-100 text-blue-800 border-blue-200',
  recruiter: 'bg-green-100 text-green-800 border-green-200',
  user: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function PermissionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
    } else {
      fetchUsers();
    }
  }, [user, router]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userAPI.getAllUsers(0, 1000);
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch users');
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (userId: number) => {
    try {
      // Derive permissions from user role
      // The backend creates permissions automatically based on role
      const user = users.find(u => u.id === userId);
      if (user) {
        setUserPermissions({
          id: 0,
          user_id: userId,
          ...ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.user,
          created_at: '',
          updated_at: '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    fetchUserPermissions(user.id);
  };

  const handleRoleUpdate = async (userId: number, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role? This will update their permissions.`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await userAPI.updateUser(userId, { role: newRole as any });
      setSuccess('User role updated successfully! Permissions will be updated automatically.');
      await fetchUsers();
      if (selectedUser?.id === userId) {
        const updatedUser = users.find(u => u.id === userId);
        if (updatedUser) {
          setSelectedUser(updatedUser);
          fetchUserPermissions(userId);
        }
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user role');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleStats = {
    total: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    manager: users.filter((u) => u.role === 'manager').length,
    recruiter: users.filter((u) => u.role === 'recruiter').length,
    user: users.filter((u) => u.role === 'user').length,
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <div className="text-brand-600">
                  <FaShieldAlt size={24} />
                </div>
                Permissions Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage user roles and permissions (Admin only)</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-5">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{roleStats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Admins</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{roleStats.admin}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Managers</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{roleStats.manager}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Recruiters</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{roleStats.recruiter}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Users</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-600">{roleStats.user}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200 mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="recruiter">Recruiter</option>
                <option value="user">User</option>
              </select>
            </div>
            <div className="mt-3 text-xs sm:text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{users.length}</span> users
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-5 bg-brand-50 border-l-4 border-brand-500 text-brand-700 p-4 rounded-lg">
            <p className="font-medium">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Users</h2>
              </div>
              <div className="overflow-x-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <p>No users found</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-brand-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((u) => {
                        const RoleIcon = ROLE_ICONS[u.role] || FaUser;
                        return (
                          <tr
                            key={u.id}
                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                              selectedUser?.id === u.id ? 'bg-brand-50' : ''
                            }`}
                            onClick={() => handleUserClick(u)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                                  u.role === 'admin' ? 'bg-purple-500' :
                                  u.role === 'manager' ? 'bg-blue-500' :
                                  u.role === 'recruiter' ? 'bg-green-500' :
                                  'bg-gray-500'
                                }`}>
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                  <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>
                                <div className="mr-1.5">
                                  <RoleIcon size={12} />
                                </div>
                                {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                                    u.is_active
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {u.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {u.is_verified && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold w-fit bg-brand-100 text-brand-800">
                                    Verified
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <Link
                                  href={`/dashboard/users/${u.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <FaEye size={14} />
                                </Link>
                                <Link
                                  href={`/dashboard/users/${u.id}/edit`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                                  title="Edit User"
                                >
                                  <FaEdit size={14} />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Permissions Panel */}
          <div className="space-y-5">
            {/* Selected User Permissions */}
            {selectedUser && userPermissions && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">User Permissions</h3>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setUserPermissions(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
                <div className="space-y-2 mb-4">
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                    const hasPermission = userPermissions[key as keyof Permission];
                    return (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-700">{label}</span>
                        <div className={hasPermission ? 'text-green-600' : 'text-gray-300'}>
                          {hasPermission ? (
                            <FaCheckCircle size={16} />
                          ) : (
                            <FaTimesCircle size={16} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Change Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => handleRoleUpdate(selectedUser.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="user">User</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">Changing role will update permissions automatically</p>
                </div>
              </div>
            )}

            {/* Role Permissions Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">Role Permissions</h3>
              <div className="space-y-4">
                {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => {
                  const RoleIcon = ROLE_ICONS[role as keyof typeof ROLE_ICONS] || FaUser;
                  const permissionCount = Object.values(permissions).filter(Boolean).length;
                  return (
                    <div key={role} className="border border-gray-200 rounded-lg p-3 hover:border-brand-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${ROLE_COLORS[role as keyof typeof ROLE_COLORS]?.split(' ')[0] || 'bg-gray-100'} ${ROLE_COLORS[role as keyof typeof ROLE_COLORS]?.split(' ')[1] || 'text-gray-600'}`}>
                            <RoleIcon size={14} />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 capitalize">{role}</span>
                        </div>
                        <span className="text-xs text-gray-500">{permissionCount} permissions</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 mt-2">
                        {Object.entries(permissions).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-1.5 text-xs">
                            <div className={value ? 'text-green-600' : 'text-gray-300'}>
                              {value ? (
                                <FaCheckCircle size={10} />
                              ) : (
                                <FaTimesCircle size={10} />
                              )}
                            </div>
                            <span className="text-gray-600 truncate">{PERMISSION_LABELS[key as keyof typeof PERMISSION_LABELS]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
