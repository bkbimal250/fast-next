'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jobAPI } from '@/lib/job';
import { userAPI } from '@/lib/user';
import { spaAPI } from '@/lib/spa';
import { applicationAPI } from '@/lib/application';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { 
  FaChartLine, 
  FaBriefcase, 
  FaUser, 
  FaBuilding, 
  FaFileAlt, 
  FaMapMarkerAlt,
  FaShieldAlt,
  FaCog,
  FaArrowRight,
  FaEnvelope
} from 'react-icons/fa';

interface DashboardStats {
  totalJobs: number;
  totalApplications: number;
  totalUsers: number;
  totalSPAs: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalApplications: 0,
    totalUsers: 0,
    totalSPAs: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchStats();
    }
  }, [user, loading, router]);

  const fetchStats = async () => {
    if (!user) return;
    
    setLoadingStats(true);
    try {
      const [jobCountData, usersData, spasData, applicationsData] = await Promise.all([
        jobAPI.getJobCount().catch(() => ({ count: 0 })),
        user.role === 'admin' ? userAPI.getAllUsers(0, 1000).catch(() => []) : Promise.resolve([]),
        user.role === 'admin' || user.role === 'manager' 
          ? spaAPI.getSpas({ skip: 0, limit: 1000 }).catch(() => [])
          : Promise.resolve([]),
        user.role === 'admin' || user.role === 'manager' || user.role === 'recruiter'
          ? applicationAPI.getAllApplications({ skip: 0, limit: 1000 }).catch(() => [])
          : Promise.resolve([]),
      ]);

      setStats({
        totalJobs: jobCountData.count || 0,
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        totalSPAs: Array.isArray(spasData) ? spasData.length : 0,
        totalApplications: Array.isArray(applicationsData) ? applicationsData.length : 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get quick links based on role
  const getQuickLinks = () => {
    const baseLinks = [
      {
        title: 'My Applications',
        description: 'View your job applications',
        link: '/dashboard/applications',
        icon: FaFileAlt,
        color: 'bg-blue-100 text-blue-600',
      },
      {
        title: 'Browse Jobs',
        description: 'Find your next opportunity',
        link: '/jobs',
        icon: FaBriefcase,
        color: 'bg-brand-100 text-brand-600',
      },
    ];

    if (user.role === 'admin') {
      return [
        {
          title: 'Messages',
          description: 'View job inquiry messages',
          link: '/dashboard/messages',
          icon: FaEnvelope,
          color: 'bg-indigo-100 text-indigo-600',
        },
        {
          title: 'Analytics',
          description: 'System-wide statistics',
          link: '/dashboard/analytics',
          icon: FaChartLine,
          color: 'bg-purple-100 text-purple-600',
        },
        {
          title: 'Manage Jobs',
          description: 'Oversee all job postings',
          link: '/dashboard/jobs',
          icon: FaBriefcase,
          color: 'bg-brand-100 text-brand-600',
        },
        {
          title: 'Manage SPAs',
          description: 'View all spa listings',
          link: '/dashboard/spas',
          icon: FaBuilding,
          color: 'bg-blue-100 text-blue-600',
        },
        {
          title: 'Manage Users',
          description: 'User management',
          link: '/dashboard/users',
          icon: FaUser,
          color: 'bg-red-100 text-red-600',
        },
        {
          title: 'Locations',
          description: 'Manage locations',
          link: '/dashboard/locations',
          icon: FaMapMarkerAlt,
          color: 'bg-teal-100 text-teal-600',
        },
        {
          title: 'Permissions',
          description: 'Role & permissions',
          link: '/dashboard/permissions',
          icon: FaShieldAlt,
          color: 'bg-orange-100 text-orange-600',
        },
      ];
    } else if (user.role === 'manager') {
      return [
        {
          title: 'Messages',
          description: 'View job inquiry messages',
          link: '/dashboard/messages',
          icon: FaEnvelope,
          color: 'bg-indigo-100 text-indigo-600',
        },
        {
          title: 'Manage SPAs',
          description: 'View and edit your SPAs',
          link: '/dashboard/spas',
          icon: FaBuilding,
          color: 'bg-blue-100 text-blue-600',
        },
        {
          title: 'Manage Jobs',
          description: 'View and edit jobs',
          link: '/dashboard/jobs',
          icon: FaBriefcase,
          color: 'bg-brand-100 text-brand-600',
        },
        {
          title: 'Applications',
          description: 'View job applications',
          link: '/dashboard/applications',
          icon: FaFileAlt,
          color: 'bg-green-100 text-green-600',
        },
        {
          title: 'Analytics',
          description: 'View analytics',
          link: '/dashboard/analytics',
          icon: FaChartLine,
          color: 'bg-purple-100 text-purple-600',
        },
      ];
    } else if (user.role === 'recruiter') {
      return [
        {
          title: 'My Jobs',
          description: 'Manage your job postings',
          link: '/dashboard/jobs',
          icon: FaBriefcase,
          color: 'bg-brand-100 text-brand-600',
        },
        {
          title: 'Applications',
          description: 'View job applications',
          link: '/dashboard/applications',
          icon: FaFileAlt,
          color: 'bg-green-100 text-green-600',
        },
      ];
    }

    return baseLinks;
  };

  const quickLinks = getQuickLinks();
  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    recruiter: 'Recruiter',
    user: 'User',
  };

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
                  <FaCog size={28} />
                </div>
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Welcome back, <span className="font-semibold text-gray-900">{user.name}</span>
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-semibold">
                {roleLabels[user.role] || user.role}
              </span>
            </div>
            <Link
              href="/profile"
              className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
            >
              Edit Profile
            </Link>
          </div>

          {/* Statistics Cards */}
          {(user.role === 'admin' || user.role === 'manager') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Jobs</p>
                  <div className="bg-brand-100 rounded-lg p-2">
                    <div className="text-brand-600">
                      <FaBriefcase size={16} />
                    </div>
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalJobs.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Active postings</p>
              </div>

              {user.role === 'admin' && (
                <>
                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
                      <div className="bg-blue-100 rounded-lg p-2">
                        <div className="text-blue-600">
                          <FaUser size={16} />
                        </div>
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Registered users</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total SPAs</p>
                      <div className="bg-purple-100 rounded-lg p-2">
                        <div className="text-purple-600">
                          <FaBuilding size={16} />
                        </div>
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalSPAs.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Total businesses</p>
                  </div>
                </>
              )}

              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Applications</p>
                  <div className="bg-green-100 rounded-lg p-2">
                    <div className="text-green-600">
                      <FaFileAlt size={16} />
                    </div>
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalApplications.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Total received</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link
                  key={index}
                  href={link.link}
                  className="group p-4 border-2 border-gray-200 rounded-lg hover:border-brand-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${link.color} p-3 rounded-lg flex-shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-1">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-600">{link.description}</p>
                    </div>
                    <div className="text-gray-400 group-hover:text-brand-600 transition-colors flex-shrink-0">
                      <FaArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Role-specific Actions */}
        {user.role === 'admin' && (
          <div className="bg-gradient-to-r from-brand-50 to-gold-50 border border-brand-200 rounded-xl p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Admin Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/jobs/create"
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Post New Job
              </Link>
              <Link
                href="/dashboard/spas/create"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Add New SPA
              </Link>
              <Link
                href="/dashboard/users"
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 font-semibold rounded-lg transition-colors text-sm"
              >
                Manage Users
              </Link>
              <Link
                href="/dashboard/analytics"
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 font-semibold rounded-lg transition-colors text-sm"
              >
                View Analytics
              </Link>
            </div>
          </div>
        )}

        {user.role === 'manager' && (
          <div className="bg-gradient-to-r from-brand-50 to-gold-50 border border-brand-200 rounded-xl p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Manager Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/jobs/create"
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Post New Job
              </Link>
              <Link
                href="/dashboard/spas/create"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Add New SPA
              </Link>
              <Link
                href="/dashboard/applications"
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 font-semibold rounded-lg transition-colors text-sm"
              >
                View Applications
              </Link>
            </div>
          </div>
        )}

        {user.role === 'recruiter' && (
          <div className="bg-gradient-to-r from-brand-50 to-gold-50 border border-brand-200 rounded-xl p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Recruiter Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/jobs/create"
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Post New Job
              </Link>
              <Link
                href="/dashboard/applications"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                View Applications
              </Link>
            </div>
          </div>
        )}

        {user.role === 'user' && (
          <div className="bg-gradient-to-r from-brand-50 to-gold-50 border border-brand-200 rounded-xl p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Get Started</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Browse Jobs
              </Link>
              <Link
                href="/dashboard/applications"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                My Applications
              </Link>
              <Link
                href="/profile"
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 font-semibold rounded-lg transition-colors text-sm"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
