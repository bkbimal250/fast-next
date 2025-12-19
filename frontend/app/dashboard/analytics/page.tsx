'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsAPI, PopularLocation } from '@/lib/analytics';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popularLocations, setPopularLocations] = useState<PopularLocation[]>([]);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      router.push('/dashboard');
    } else {
      fetchAnalytics();
    }
  }, [user, router]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const locations = await analyticsAPI.getPopularLocations(10);
      setPopularLocations(locations);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch analytics');
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">System-wide statistics and insights</p>
          </div>
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Jobs</h3>
            <p className="text-3xl font-bold text-primary-600">-</p>
            <p className="text-sm text-gray-500 mt-1">Active job postings</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Applications</h3>
            <p className="text-3xl font-bold text-green-600">-</p>
            <p className="text-sm text-gray-500 mt-1">Job applications received</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">-</p>
            <p className="text-sm text-gray-500 mt-1">Registered users</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Locations</h2>
          {popularLocations.length === 0 ? (
            <p className="text-gray-500">No location data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {popularLocations.map((location, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {location.city || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {location.state || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {location.country || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                        {location.job_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Analytics</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">
              More analytics features coming soon, including:
            </p>
            <ul className="list-disc list-inside mt-2 text-yellow-700 space-y-1">
              <li>Job view statistics</li>
              <li>Application conversion rates</li>
              <li>Popular job types</li>
              <li>User engagement metrics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

