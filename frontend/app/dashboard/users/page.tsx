'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, User } from '@/lib/user';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { FaUsers, FaUser, FaUserShield, FaUserTie, FaSearch, FaEdit, FaTrash, FaEye, FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

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

// Calculate profile completion percentage
const calculateProfileCompletion = (user: User): number => {
  if (!user) return 0;
  
  const fields = [
    user.name,
    user.email,
    user.phone,
    user.profile_photo,
    user.bio,
    user.address,
    user.city_id,
    user.state_id,
    user.country_id,
    user.resume_path,
  ];
  
  const completedFields = fields.filter(field => {
    if (field === null || field === undefined) return false;
    if (typeof field === 'string' && field.trim() === '') return false;
    if (typeof field === 'number' && field === 0) return false;
    return true;
  }).length;
  
  const totalFields = fields.length;
  const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  
  return Math.max(0, Math.min(100, percentage)); // Ensure it's between 0 and 100
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';

// Get profile photo URL
const getProfilePhotoUrl = (profilePhoto?: string): string | null => {
  if (!profilePhoto) return null;
  // Check if it's already a full URL
  if (profilePhoto.startsWith('http://') || profilePhoto.startsWith('https://')) {
    return profilePhoto;
  }
  // Otherwise, prepend API URL
  return `${API_URL}/${profilePhoto}`;
};

export default function ManageUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: '',
  });
  const [deleting, setDeleting] = useState(false);

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
      const fetchedUsers = await userAPI.getAllUsers(0, 1000);
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch users');
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userId: number, userName: string) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const handleDeleteConfirm = async (permanent: boolean) => {
    if (!deleteModal.userId) return;

    setDeleting(true);
    try {
      await userAPI.deleteUser(deleteModal.userId, permanent);
      setUsers(users.filter((u) => u.id !== deleteModal.userId));
      setDeleteModal({ isOpen: false, userId: null, userName: '' });
      setSuccess(permanent ? 'User permanently deleted' : 'User deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
      console.error('Failed to delete user:', err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.is_active) ||
        (statusFilter === 'inactive' && !u.is_active) ||
        (statusFilter === 'verified' && u.is_verified);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const roleStats = {
    total: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    manager: users.filter((u) => u.role === 'manager').length,
    recruiter: users.filter((u) => u.role === 'recruiter').length,
    user: users.filter((u) => u.role === 'user').length,
    active: users.filter((u) => u.is_active).length,
    verified: users.filter((u) => u.is_verified).length,
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
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
                  <FaUsers size={28} />
                </div>
                User Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">View and manage all users (Admin only)</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/users/create"
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <FaPlus size={14} />
                Add New User
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Profile Completion Summary */}
          {users.length > 0 && (
            <div className="bg-gradient-to-r from-brand-50 to-blue-50 rounded-xl shadow-sm p-4 sm:p-5 border border-brand-200 mb-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Profile Completion Overview</h3>
                  <p className="text-xs text-gray-600">
                    {(() => {
                      const avgCompletion = users.length > 0
                        ? Math.round(users.reduce((sum, u) => sum + calculateProfileCompletion(u), 0) / users.length)
                        : 0;
                      const completeProfiles = users.filter(u => calculateProfileCompletion(u) >= 80).length;
                      return `${completeProfiles} of ${users.length} users have complete profiles (${avgCompletion}% average)`;
                    })()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const avgCompletion = users.length > 0
                      ? Math.round(users.reduce((sum, u) => sum + calculateProfileCompletion(u), 0) / users.length)
                      : 0;
                    return (
                      <>
                        <div className="w-24 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              avgCompletion >= 80 ? 'bg-green-500' : avgCompletion >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${avgCompletion}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${
                          avgCompletion >= 80 ? 'text-green-600' : avgCompletion >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {avgCompletion}%
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-5">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
                <div className="bg-brand-100 rounded-lg p-2">
                  <div className="text-brand-600">
                    <FaUsers size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{roleStats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Admins</p>
                <div className="bg-purple-100 rounded-lg p-2">
                  <div className="text-purple-600">
                    <FaUserShield size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{roleStats.admin}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Managers</p>
                <div className="bg-blue-100 rounded-lg p-2">
                  <div className="text-blue-600">
                    <FaUserTie size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{roleStats.manager}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Recruiters</p>
                <div className="bg-green-100 rounded-lg p-2">
                  <div className="text-green-600">
                    <FaUsers size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{roleStats.recruiter}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Users</p>
                <div className="bg-gray-100 rounded-lg p-2">
                  <div className="text-gray-600">
                    <FaUser size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-600">{roleStats.user}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active</p>
                <div className="bg-green-100 rounded-lg p-2">
                  <div className="text-green-600">
                    <FaCheckCircle size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{roleStats.active}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Verified</p>
                <div className="bg-brand-100 rounded-lg p-2">
                  <div className="text-brand-600">
                    <FaCheckCircle size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-brand-600">{roleStats.verified}</p>
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

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative md:col-span-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <div className="text-gray-400">
                  <FaSearch size={16} />
                </div>
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Filter by Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="recruiter">Recruiter</option>
                <option value="user">User</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </div>
          <div className="mt-3 text-xs sm:text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{users.length}</span> users
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 && !loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FaUsers size={48} />
            </div>
            <p className="text-gray-500 mb-4">No users found</p>
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
              <p className="text-sm text-gray-400 mb-4">Try adjusting your filters</p>
            ) : (
              <Link
                href="/dashboard/users/create"
                className="inline-block px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Create First User
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-brand-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      User (Click to View Profile)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Profile Completion
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((u) => {
                    const RoleIcon = ROLE_ICONS[u.role] || FaUser;
                    const profileCompletion = calculateProfileCompletion(u);
                    const profilePhotoUrl = getProfilePhotoUrl(u.profile_photo);
                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden ${
                                u.role === 'admin'
                                  ? 'bg-purple-500'
                                  : u.role === 'manager'
                                  ? 'bg-blue-500'
                                  : u.role === 'recruiter'
                                  ? 'bg-green-500'
                                  : 'bg-gray-500'
                              }`}
                            >
                              {profilePhotoUrl ? (
                                <img
                                  src={profilePhotoUrl}
                                  alt={u.name}
                                  className="w-full h-full rounded-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.textContent = u.name.charAt(0).toUpperCase();
                                  }}
                                />
                              ) : (
                                u.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/dashboard/users/${u.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-brand-600 transition-colors cursor-pointer"
                              >
                                {u.name}
                              </Link>
                              {u.bio && <p className="text-xs text-gray-500 truncate max-w-xs">{u.bio}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{u.email}</div>
                          <div className="text-xs text-gray-500">{u.phone}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}
                          >
                            <div className="mr-1.5">
                              <RoleIcon size={12} />
                            </div>
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                                u.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {u.is_active ? (
                                <>
                                  <div className="mr-1.5">
                                    <FaCheckCircle size={10} />
                                  </div>
                                  Active
                                </>
                              ) : (
                                <>
                                  <div className="mr-1.5">
                                    <FaTimesCircle size={10} />
                                  </div>
                                  Inactive
                                </>
                              )}
                            </span>
                            {u.is_verified && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold w-fit bg-brand-100 text-brand-800">
                                <div className="mr-1.5">
                                  <FaCheckCircle size={10} />
                                </div>
                                Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 min-w-[60px] max-w-[100px]">
                              <div
                                className={`h-2.5 rounded-full transition-all ${
                                  profileCompletion >= 80
                                    ? 'bg-green-500'
                                    : profileCompletion >= 50
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.max(0, Math.min(100, profileCompletion))}%` }}
                                title={`${profileCompletion}% Complete`}
                              />
                            </div>
                            <span className={`text-xs font-bold min-w-[45px] text-right ${
                              profileCompletion >= 80
                                ? 'text-green-600'
                                : profileCompletion >= 50
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}>
                              {profileCompletion}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/dashboard/users/${u.id}`}
                              className="p-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors group relative"
                              title="View Profile"
                            >
                              <FaEye size={14} />
                              <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                View Profile
                              </span>
                            </Link>
                            <Link
                              href={`/dashboard/users/${u.id}/edit`}
                              className="p-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors group relative"
                              title="Edit User"
                            >
                              <FaEdit size={14} />
                              <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Edit User
                              </span>
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(u.id, u.name)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors group relative"
                              title="Delete User"
                            >
                              <FaTrash size={14} />
                              <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Delete User
                              </span>
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

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, userId: null, userName: '' })}
          onConfirm={handleDeleteConfirm}
          title="Delete User"
          message="Are you sure you want to delete this user?"
          itemName={deleteModal.userName}
          isAdmin={user?.role === 'admin'}
          loading={deleting}
        />
      </div>
    </div>
  );
}
