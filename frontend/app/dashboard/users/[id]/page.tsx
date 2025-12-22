'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, User } from '@/lib/user';
import { locationAPI, Location } from '@/lib/location';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ViewUserPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id ? parseInt(params.id as string) : null;

  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationNames, setLocationNames] = useState<{
    country?: string;
    state?: string;
    city?: string;
  }>({});

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
    } else if (userId) {
      fetchUser();
    }
  }, [user, router, userId]);

  useEffect(() => {
    if (userData) {
      fetchLocationNames();
    }
  }, [userData]);

  const fetchUser = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userAPI.getUserById(userId);
      setUserData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch user');
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationNames = async () => {
    if (!userData) return;
    try {
      const [countries, states, cities] = await Promise.all([
        locationAPI.getCountries(),
        userData.country_id ? locationAPI.getStates(userData.country_id) : Promise.resolve([]),
        userData.state_id ? locationAPI.getCities(userData.state_id, userData.country_id) : Promise.resolve([]),
      ]);

      const country = countries.find((c) => c.id === userData.country_id);
      const state = states.find((s) => s.id === userData.state_id);
      const city = cities.find((c) => c.id === userData.city_id);

      setLocationNames({
        country: country?.name,
        state: state?.name,
        city: city?.name,
      });
    } catch (err) {
      console.error('Failed to fetch location names:', err);
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 mb-4">{error || 'User not found'}</p>
            <Link href="/dashboard/users" className="btn-primary inline-block">
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8010';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{userData.name}</h1>
            <p className="text-gray-600 mt-2">User Profile</p>
          </div>
          <div className="flex space-x-3">
            <Link href={`/dashboard/users/${userData.id}/edit`} className="btn-primary">
              Edit User
            </Link>
            <Link href="/dashboard/users" className="btn-secondary">
              Back to List
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Photo */}
            {userData.profile_photo && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Photo</h2>
                <img
                  src={`${API_URL}/${userData.profile_photo}`}
                  alt={userData.name}
                  className="w-32 h-32 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Basic Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{userData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{userData.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{userData.phone}</p>
                </div>
                {userData.bio && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bio</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{userData.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {(userData.address || locationNames.country || locationNames.state || locationNames.city) && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                <div className="space-y-4">
                  {userData.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900">{userData.address}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {locationNames.country && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Country</label>
                        <p className="text-gray-900">{locationNames.country}</p>
                      </div>
                    )}
                    {locationNames.state && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">State</label>
                        <p className="text-gray-900">{locationNames.state}</p>
                      </div>
                    )}
                    {locationNames.city && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">City</label>
                        <p className="text-gray-900">{locationNames.city}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                    {userData.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      userData.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {userData.is_active ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verified</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      userData.is_verified
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {userData.is_verified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Resume */}
            {userData.resume_path && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume</h2>
                <a
                  href={`${API_URL}/${userData.resume_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  View Resume
                </a>
              </div>
            )}

            {/* Metadata */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>{' '}
                  <span className="text-gray-900">
                    {new Date(userData.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Updated:</span>{' '}
                  <span className="text-gray-900">
                    {new Date(userData.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

