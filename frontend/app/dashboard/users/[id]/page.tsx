'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, User } from '@/lib/user';
import { locationAPI } from '@/lib/location';
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL ;

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

  const profilePhotoUrl = getProfilePhotoUrl(userData.profile_photo);

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
            {/* Profile Header with Photo */}
            <div className="card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt={userData.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-32 h-32 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-100 shadow-lg">${userData.name.charAt(0).toUpperCase()}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-100 shadow-lg">
                      {userData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{userData.name}</h2>
                  <p className="text-gray-600 mb-1">{userData.email}</p>
                  <p className="text-gray-600 mb-3">{userData.phone}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize font-semibold">
                      {userData.role}
                    </span>
                    {userData.is_active && (
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-semibold">
                        Active
                      </span>
                    )}
                    {userData.is_verified && (
                      <span className="px-3 py-1 text-xs rounded-full bg-brand-100 text-brand-800 font-semibold">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Full Name</label>
                  <p className="text-gray-900 font-medium">{userData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Email Address</label>
                  <p className="text-gray-900 font-medium">{userData.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Phone Number</label>
                  <p className="text-gray-900 font-medium">{userData.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">User ID</label>
                  <p className="text-gray-900 font-medium">#{userData.id}</p>
                </div>
              </div>
              {userData.bio && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-500 block mb-2">Bio</label>
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{userData.bio}</p>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Information</h2>
              {userData.address || locationNames.country || locationNames.state || locationNames.city ? (
                <div className="space-y-4">
                  {userData.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Street Address</label>
                      <p className="text-gray-900">{userData.address}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {locationNames.city && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">City</label>
                        <p className="text-gray-900 font-medium">{locationNames.city}</p>
                      </div>
                    )}
                    {locationNames.state && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">State</label>
                        <p className="text-gray-900 font-medium">{locationNames.state}</p>
                      </div>
                    )}
                    {locationNames.country && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Country</label>
                        <p className="text-gray-900 font-medium">{locationNames.country}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No location information provided</p>
              )}
            </div>

            {/* Resume Section */}
            {userData.resume_path && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume</h2>
                <a
                  href={`${API_URL}/${userData.resume_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Resume
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            {(() => {
              const fields = [
                userData.name,
                userData.email,
                userData.phone,
                userData.profile_photo,
                userData.bio,
                userData.address,
                userData.city_id,
                userData.state_id,
                userData.country_id,
                userData.resume_path,
              ];
              const completedFields = fields.filter(field => {
                if (field === null || field === undefined) return false;
                if (typeof field === 'string' && field.trim() === '') return false;
                if (typeof field === 'number' && field === 0) return false;
                return true;
              }).length;
              const totalFields = fields.length;
              const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
              const profileCompletion = Math.max(0, Math.min(100, percentage));
              
              return (
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Completion</h2>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className={`text-sm font-bold ${
                          profileCompletion >= 80
                            ? 'text-green-600'
                            : profileCompletion >= 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {profileCompletion}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            profileCompletion >= 80
                              ? 'bg-green-500'
                              : profileCompletion >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${profileCompletion}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {completedFields} of {totalFields} fields completed
                    </div>
                  </div>
                </div>
              );
            })()}

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

            {/* Account Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Account Created</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {new Date(userData.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {new Date(userData.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {userData.managed_spa_id && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Managed SPA ID</span>
                    <span className="text-sm text-gray-900 font-medium">#{userData.managed_spa_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

