'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsAPI } from '@/lib/analytics';
import { jobAPI } from '@/lib/job';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { 
  FaWhatsapp, 
  FaPhone, 
  FaShareAlt, 
  FaMousePointer,
  FaChartLine,
  FaCalendarAlt,
  FaBriefcase,
  FaArrowLeft
} from 'react-icons/fa';

interface ButtonClickCounts {
  whatsapp: number;
  call: number;
  share: number;
  apply: number;
}

interface ButtonClickByDay {
  date: string;
  button_type: string;
  count: number;
}

interface ButtonClickByJob {
  job_id: number;
  button_type: string;
  count: number;
}

export default function ClickAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedButtonType, setSelectedButtonType] = useState<'whatsapp' | 'call' | 'share' | 'apply' | 'all'>('all');
  
  const [buttonCounts, setButtonCounts] = useState<ButtonClickCounts>({
    whatsapp: 0,
    call: 0,
    share: 0,
    apply: 0,
  });
  const [clicksByDay, setClicksByDay] = useState<ButtonClickByDay[]>([]);
  const [clicksByJob, setClicksByJob] = useState<ButtonClickByJob[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      router.push('/dashboard');
    } else {
      fetchClickAnalytics();
    }
  }, [user, router, timeRange, selectedJobId, selectedButtonType]);

  const fetchClickAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const daysParam = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : undefined;
      const buttonTypeParam = selectedButtonType === 'all' ? undefined : selectedButtonType;

      // Fetch button click data
      const [countsData, byDayData, byJobData] = await Promise.all([
        analyticsAPI.getButtonClicks(selectedJobId || undefined, buttonTypeParam, daysParam).catch(() => {
          // If it's a single job, return counts object
          if (selectedJobId) {
            return { whatsapp: 0, call: 0, share: 0, apply: 0 };
          }
          return [];
        }),
        analyticsAPI.getButtonClicksByDay(buttonTypeParam, daysParam || 30).catch(() => []),
        !selectedJobId 
          ? analyticsAPI.getButtonClicks(undefined, buttonTypeParam, daysParam).catch(() => [])
          : Promise.resolve([]),
      ]);

      // Process counts data
      if (selectedJobId && typeof countsData === 'object' && !Array.isArray(countsData)) {
        // Single job counts
        setButtonCounts({
          whatsapp: countsData.whatsapp || 0,
          call: countsData.call || 0,
          share: countsData.share || 0,
          apply: countsData.apply || 0,
        });
        setTotalClicks(
          (countsData.whatsapp || 0) + 
          (countsData.call || 0) + 
          (countsData.share || 0) + 
          (countsData.apply || 0)
        );
      } else if (Array.isArray(countsData)) {
        // Multiple jobs - aggregate counts
        const aggregated: ButtonClickCounts = { whatsapp: 0, call: 0, share: 0, apply: 0 };
        countsData.forEach((item: any) => {
          if (item.button_type === 'whatsapp') aggregated.whatsapp += item.count || 0;
          if (item.button_type === 'call') aggregated.call += item.count || 0;
          if (item.button_type === 'share') aggregated.share += item.count || 0;
          if (item.button_type === 'apply') aggregated.apply += item.count || 0;
        });
        setButtonCounts(aggregated);
        setTotalClicks(aggregated.whatsapp + aggregated.call + aggregated.share + aggregated.apply);
        setClicksByJob(countsData);
      }

      // Process daily data
      setClicksByDay(Array.isArray(byDayData) ? byDayData : []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch click analytics');
      console.error('Failed to fetch click analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && totalClicks === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading click analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return null;
  }

  const buttonTypeColors = {
    whatsapp: { bg: 'bg-green-100', text: 'text-green-700', icon: 'text-green-600', border: 'border-green-300' },
    call: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'text-blue-600', border: 'border-blue-300' },
    share: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'text-purple-600', border: 'border-purple-300' },
    apply: { bg: 'bg-gold-100', text: 'text-gold-700', icon: 'text-gold-600', border: 'border-gold-300' },
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
                  <FaMousePointer size={28} />
                </div>
                Button Click Analytics
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Track WhatsApp, Call, Share, and Apply button clicks
              </p>
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
                className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base flex items-center gap-2"
              >
                <FaArrowLeft size={14} />
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <select
              value={selectedButtonType}
              onChange={(e) => setSelectedButtonType(e.target.value as any)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-medium bg-white"
            >
              <option value="all">All Button Types</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="call">Call</option>
              <option value="share">Share</option>
              <option value="apply">Apply</option>
            </select>
            <input
              type="number"
              placeholder="Filter by Job ID (optional)"
              value={selectedJobId || ''}
              onChange={(e) => setSelectedJobId(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-medium bg-white"
            />
            {selectedJobId && (
              <button
                onClick={() => setSelectedJobId(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Job Filter
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Clicks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalClicks.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-brand-100 rounded-lg">
                <FaMousePointer className="w-8 h-8 text-brand-600" />
              </div>
            </div>
          </div>

          {/* WhatsApp Clicks */}
          <div className={`bg-white rounded-lg shadow-sm border-2 ${buttonTypeColors.whatsapp.border} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">WhatsApp</p>
                <p className={`text-3xl font-bold ${buttonTypeColors.whatsapp.text} mt-2`}>
                  {buttonCounts.whatsapp.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalClicks > 0 ? Math.round((buttonCounts.whatsapp / totalClicks) * 100) : 0}% of total
                </p>
              </div>
              <div className={`p-3 ${buttonTypeColors.whatsapp.bg} rounded-lg`}>
                <FaWhatsapp className={`w-8 h-8 ${buttonTypeColors.whatsapp.icon}`} />
              </div>
            </div>
          </div>

          {/* Call Clicks */}
          <div className={`bg-white rounded-lg shadow-sm border-2 ${buttonTypeColors.call.border} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Call</p>
                <p className={`text-3xl font-bold ${buttonTypeColors.call.text} mt-2`}>
                  {buttonCounts.call.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalClicks > 0 ? Math.round((buttonCounts.call / totalClicks) * 100) : 0}% of total
                </p>
              </div>
              <div className={`p-3 ${buttonTypeColors.call.bg} rounded-lg`}>
                <FaPhone className={`w-8 h-8 ${buttonTypeColors.call.icon}`} />
              </div>
            </div>
          </div>

          {/* Share Clicks */}
          <div className={`bg-white rounded-lg shadow-sm border-2 ${buttonTypeColors.share.border} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Share</p>
                <p className={`text-3xl font-bold ${buttonTypeColors.share.text} mt-2`}>
                  {buttonCounts.share.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalClicks > 0 ? Math.round((buttonCounts.share / totalClicks) * 100) : 0}% of total
                </p>
              </div>
              <div className={`p-3 ${buttonTypeColors.share.bg} rounded-lg`}>
                <FaShareAlt className={`w-8 h-8 ${buttonTypeColors.share.icon}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Apply Clicks Card */}
        <div className={`bg-white rounded-lg shadow-sm border-2 ${buttonTypeColors.apply.border} p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Apply Button</p>
              <p className={`text-3xl font-bold ${buttonTypeColors.apply.text} mt-2`}>
                {buttonCounts.apply.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {totalClicks > 0 ? Math.round((buttonCounts.apply / totalClicks) * 100) : 0}% of total
              </p>
            </div>
            <div className={`p-3 ${buttonTypeColors.apply.bg} rounded-lg`}>
              <FaBriefcase className={`w-8 h-8 ${buttonTypeColors.apply.icon}`} />
            </div>
          </div>
        </div>

        {/* Daily Clicks Chart */}
        {clicksByDay.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-brand-600" />
              Clicks by Day
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Button Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clicksByDay.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          buttonTypeColors[item.button_type as keyof typeof buttonTypeColors]?.bg || 'bg-gray-100'
                        } ${
                          buttonTypeColors[item.button_type as keyof typeof buttonTypeColors]?.text || 'text-gray-700'
                        }`}>
                          {item.button_type.charAt(0).toUpperCase() + item.button_type.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {item.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Clicks by Job */}
        {!selectedJobId && clicksByJob.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaBriefcase className="text-brand-600" />
              Top Jobs by Clicks
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Button Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clicksByJob.slice(0, 20).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{item.job_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          buttonTypeColors[item.button_type as keyof typeof buttonTypeColors]?.bg || 'bg-gray-100'
                        } ${
                          buttonTypeColors[item.button_type as keyof typeof buttonTypeColors]?.text || 'text-gray-700'
                        }`}>
                          {item.button_type.charAt(0).toUpperCase() + item.button_type.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {item.count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedJobId(item.job_id)}
                          className="text-brand-600 hover:text-brand-700 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {clicksByDay.length === 0 && clicksByJob.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FaChartLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Click Data Available</h3>
            <p className="text-gray-600">
              No button clicks found for the selected filters. Try adjusting the time range or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
