'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsAPI, ChatbotUsageStats, TimeSeriesPoint, EventCounts, TopJobSearch, DeviceBreakdown } from '@/lib/analytics';
import { jobAPI } from '@/lib/job';
import { userAPI } from '@/lib/user';
import { spaAPI } from '@/lib/spa';
import { applicationAPI } from '@/lib/application';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { FaChartLine, FaBriefcase, FaUser, FaBuilding, FaMapMarkerAlt, FaEye, FaMousePointer, FaCalendarAlt, FaSearch, FaMobileAlt, FaLaptop, FaTabletAlt } from 'react-icons/fa';

interface AnalyticsStats {
  totalJobs: number;
  totalApplications: number;
  totalUsers: number;
  totalSPAs: number;
  totalViews: number;
  totalClicks: number;
}

interface PopularLocation {
  city: string;
  event_count: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalJobs: 0,
    totalApplications: 0,
    totalUsers: 0,
    totalSPAs: 0,
    totalViews: 0,
    totalClicks: 0,
  });
  const [popularLocations, setPopularLocations] = useState<PopularLocation[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [chatbotUsage, setChatbotUsage] = useState<ChatbotUsageStats | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [topJobSearches, setTopJobSearches] = useState<TopJobSearch[]>([]);
  const [uniqueVisitors, setUniqueVisitors] = useState<number>(0);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceBreakdown>({ mobile: 0, desktop: 0, tablet: 0 });
  const [bookingClicks, setBookingClicks] = useState<number>(0);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      router.push('/dashboard');
    } else {
      fetchAnalytics();
    }
  }, [user, router, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const daysParam = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : undefined;
      
      // Fetch all statistics in parallel - only fetch users for admins
      const [jobCountData, usersData, spasData, applicationsData, popularLocationsData, chatbotUsageData, timeSeriesData, eventCountsData, topSearchesData, uniqueVisitorsData, deviceBreakdownData, bookingClicksData] = await Promise.all([
        jobAPI.getJobCount().catch(() => ({ count: 0 })),
        user && user.role === 'admin' 
          ? userAPI.getAllUsers(0, 1000).catch(() => [])
          : Promise.resolve([]),
        user && (user.role === 'admin' || user.role === 'manager')
          ? spaAPI.getSpas({ skip: 0, limit: 1000 }).catch(() => [])
          : Promise.resolve([]),
        user && (user.role === 'admin' || user.role === 'manager' || user.role === 'recruiter')
          ? applicationAPI.getAllApplications({ skip: 0, limit: 1000 }).catch(() => [])
          : Promise.resolve([]),
        analyticsAPI
          .getPopularLocations(10, daysParam)
          .catch(() => []),
        analyticsAPI.getChatbotUsage().catch(() => ({
          total: 0,
          daily: 0,
          weekly: 0,
          monthly: 0,
          yearly: 0,
        })),
        analyticsAPI
          .getTimeSeries(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365)
          .catch(() => []),
        analyticsAPI.getEventCounts(daysParam).catch(() => ({
          page_view: 0,
          apply_click: 0,
          cv_upload: 0,
          chat_opened: 0,
          job_search: 0,
          spa_booking_click: 0,
        })),
        analyticsAPI.getTopJobSearches(10, daysParam).catch(() => []),
        analyticsAPI.getUniqueVisitors(daysParam).catch(() => ({ unique_visitors: 0 })),
        analyticsAPI.getDeviceBreakdown(daysParam).catch(() => ({ mobile: 0, desktop: 0, tablet: 0 })),
        analyticsAPI.getBookingClicks(daysParam).catch(() => ({ booking_clicks: 0 })),
      ]);

      // Calculate statistics
      const totalJobs = jobCountData.count || 0;
      const totalUsers = Array.isArray(usersData) ? usersData.length : 0;
      const totalSPAs = Array.isArray(spasData) ? spasData.length : 0;
      const totalApplications = Array.isArray(applicationsData) ? applicationsData.length : 0;

      const eventCounts: EventCounts = eventCountsData || {
        page_view: 0,
        apply_click: 0,
        cv_upload: 0,
        chat_opened: 0,
      };

      setStats({
        totalJobs,
        totalApplications,
        totalUsers,
        totalSPAs,
        totalViews: eventCounts.page_view || 0,
        totalClicks: eventCounts.apply_click || 0,
      });

      setPopularLocations(
        Array.isArray(popularLocationsData)
          ? popularLocationsData.map((loc: any) => ({
              city: loc.city || 'Unknown',
              event_count: loc.event_count || 0,
            }))
          : []
      );

      setChatbotUsage(chatbotUsageData);
      setTimeSeries(Array.isArray(timeSeriesData) ? timeSeriesData : []);
      setTopJobSearches(Array.isArray(topSearchesData) ? topSearchesData : []);
      setUniqueVisitors(uniqueVisitorsData?.unique_visitors || 0);
      setDeviceBreakdown(deviceBreakdownData || { mobile: 0, desktop: 0, tablet: 0 });
      setBookingClicks(bookingClicksData?.booking_clicks || 0);
    } catch (err: any) {
      // Only show error if it's not a permission error (403)
      if (err.response?.status !== 403) {
        setError(err.response?.data?.detail || 'Failed to fetch analytics');
        console.error('Failed to fetch analytics:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && stats.totalJobs === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
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
                  <FaChartLine size={28} />
                </div>
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">System-wide statistics and insights</p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-medium bg-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
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

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Applications</p>
              <div className="bg-green-100 rounded-lg p-2">
                <div className="text-green-600">
                  <FaMousePointer size={16} />
                </div>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalApplications.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Total received</p>
          </div>

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
              <p className="text-xs sm:text-sm font-medium text-gray-600">SPAs</p>
              <div className="bg-purple-100 rounded-lg p-2">
                <div className="text-purple-600">
                  <FaBuilding size={16} />
                </div>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalSPAs.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Total businesses</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Page Views</p>
              <div className="bg-gold-100 rounded-lg p-2">
                <div className="text-gold-600">
                  <FaEye size={16} />
                </div>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Total views</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Apply Clicks</p>
              <div className="bg-orange-100 rounded-lg p-2">
                <div className="text-orange-600">
                  <FaMousePointer size={16} />
                </div>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Total clicks</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Unique Visitors</p>
              <div className="bg-cyan-100 rounded-lg p-2">
                <div className="text-cyan-600">
                  <FaUser size={16} />
                </div>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{uniqueVisitors.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Unique people</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Booking Clicks</p>
              <div className="bg-pink-100 rounded-lg p-2">
                <div className="text-pink-600">
                  <FaCalendarAlt size={16} />
                </div>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{bookingClicks.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Appointment clicks</p>
          </div>

          {/* Chatbot Usage */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200 lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Chatbot Users</p>
              <div className="bg-indigo-100 rounded-lg p-2">
                <div className="text-indigo-600">
                  <FaChartLine size={16} />
                </div>
              </div>
            </div>
            {chatbotUsage ? (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-500">Today</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{chatbotUsage.daily}</p>
                </div>
                <div>
                  <p className="text-gray-500">This Week</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{chatbotUsage.weekly}</p>
                </div>
                <div>
                  <p className="text-gray-500">This Month</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{chatbotUsage.monthly}</p>
                </div>
                <div>
                  <p className="text-gray-500">This Year</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{chatbotUsage.yearly}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-2">No chatbot usage data available yet.</p>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {/* Top Job Searches */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="text-brand-600">
                  <FaSearch size={18} />
                </div>
                Top Job Searches
              </h2>
            </div>
            {topJobSearches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No search data available</p>
                <p className="text-sm mt-2">Search queries will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topJobSearches.map((search, index) => {
                  const maxCount = topJobSearches[0]?.count || 1;
                  const percentage = (search.count / maxCount) * 100;
                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900 truncate pr-2">"{search.search_query}"</span>
                        <span className="text-gray-600 font-semibold whitespace-nowrap">{search.count.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Device Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="text-brand-600">
                  <FaChartLine size={18} />
                </div>
                Device Breakdown
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-lg p-2">
                    <div className="text-green-600">
                      <FaMobileAlt size={14} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mobile</p>
                    <p className="text-xs text-gray-500">Phone devices</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">{deviceBreakdown.mobile.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <div className="text-blue-600">
                      <FaLaptop size={14} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Desktop</p>
                    <p className="text-xs text-gray-500">Laptop/PC</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">{deviceBreakdown.desktop.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 rounded-lg p-2">
                    <div className="text-purple-600">
                      <FaTabletAlt size={14} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tablet</p>
                    <p className="text-xs text-gray-500">Tablet devices</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">{deviceBreakdown.tablet.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Popular Locations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="text-brand-600">
                  <FaMapMarkerAlt size={18} />
                </div>
                Popular Locations
              </h2>
            </div>
            {popularLocations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No location data available</p>
                <p className="text-sm mt-2">Analytics events will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {popularLocations.map((location, index) => {
                  const maxCount = popularLocations[0]?.event_count || 1;
                  const percentage = (location.event_count / maxCount) * 100;
                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{location.city || 'Unknown'}</span>
                        <span className="text-gray-600 font-semibold">{location.event_count.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Event Types */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="text-brand-600">
                  <FaChartLine size={18} />
                </div>
                Event Types
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-100 rounded-lg p-2">
                    <div className="text-brand-600">
                      <FaEye size={14} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Page Views</p>
                    <p className="text-xs text-gray-500">Job detail page views</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.totalViews.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-lg p-2">
                    <div className="text-green-600">
                      <FaMousePointer size={14} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Apply Clicks</p>
                    <p className="text-xs text-gray-500">Application button clicks</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <div className="text-blue-600">
                      <FaBriefcase size={14} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Applications</p>
                    <p className="text-xs text-gray-500">Total applications submitted</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.totalApplications.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time-based Analytics Section */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="text-brand-600">
              <FaCalendarAlt size={18} />
            </div>
            Time-based Analytics
          </h2>
          {timeSeries.length === 0 ? (
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 text-brand-700 text-sm">
              No analytics events recorded yet for the selected period.
            </div>
          ) : (
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
              <p className="text-brand-700 text-sm font-medium mb-3">
                Daily events for the last{' '}
                {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : timeRange === '90d' ? '90 days' : 'year'}
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {timeSeries.map((point) => {
                  const maxCount = timeSeries[timeSeries.length - 1]?.event_count || 1;
                  const percentage = maxCount ? Math.max((point.event_count / maxCount) * 100, 5) : 0;
                  return (
                    <div key={point.date} className="flex items-center gap-3 text-xs sm:text-sm">
                      <div className="w-24 text-gray-700 font-medium">
                        {new Date(point.date).toLocaleDateString()}
                      </div>
                      <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-brand-100">
                        <div
                          className="h-2 bg-brand-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-10 text-right text-gray-700 font-semibold">
                        {point.event_count}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-brand-600">
                Showing total analytics events (page views, clicks, chatbot opens, etc.) grouped by day.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
