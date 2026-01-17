'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { locationAPI } from '@/lib/location';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { FaEdit, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaArrowLeft } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export default function ViewProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [locationNames, setLocationNames] = useState<{
    country?: string;
    state?: string;
    city?: string;
  }>({});

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchLocationNames();
    }
  }, [user, router]);

  const fetchLocationNames = async () => {
    if (!user) return;
    try {
      const [countries, states, cities] = await Promise.all([
        locationAPI.getCountries(),
        user.country_id ? locationAPI.getStates(user.country_id) : Promise.resolve([]),
        user.state_id ? locationAPI.getCities(user.state_id, user.country_id) : Promise.resolve([]),
      ]);

      const country = countries.find((c) => c.id === user.country_id);
      const state = states.find((s) => s.id === user.state_id);
      const city = cities.find((c) => c.id === user.city_id);

      setLocationNames({
        country: country?.name,
        state: state?.name,
        city: city?.name,
      });
    } catch (err) {
      console.error('Failed to fetch location names:', err);
    }
  };

  // Get profile photo URL
  const getProfilePhotoUrl = (profilePhoto?: string): string | null => {
    if (!profilePhoto) return null;
    if (profilePhoto.startsWith('http://') || profilePhoto.startsWith('https://')) {
      return profilePhoto;
    }
    return `${API_URL}/${profilePhoto}`;
  };

  // Calculate profile completion
  const calculateProfileCompletion = (): number => {
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
    
    return Math.max(0, Math.min(100, percentage));
  };

  if (!user) {
    return null;
  }

  const profilePhotoUrl = getProfilePhotoUrl(user.profile_photo);
  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">View your complete profile information</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/profile" className="btn-primary flex items-center gap-2">
              <FaEdit size={14} />
              Edit Profile
            </Link>
            <Link href="/dashboard" className="btn-secondary flex items-center gap-2">
              <FaArrowLeft size={14} />
              Back to Dashboard
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
                      alt={user.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-32 h-32 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-100 shadow-lg">${user.name.charAt(0).toUpperCase()}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-100 shadow-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
                  <p className="text-gray-600 mb-1 flex items-center gap-2">
                    <FaEnvelope size={14} />
                    {user.email}
                  </p>
                  <p className="text-gray-600 mb-3 flex items-center gap-2">
                    <FaPhone size={14} />
                    {user.phone}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize font-semibold">
                      {user.role}
                    </span>
                    {user.is_active && (
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-semibold">
                        Active
                      </span>
                    )}
                    {user.is_verified && (
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
                  <p className="text-gray-900 font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Email Address</label>
                  <p className="text-gray-900 font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Phone Number</label>
                  <p className="text-gray-900 font-medium">{user.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">User ID</label>
                  <p className="text-gray-900 font-medium">#{user.id}</p>
                </div>
              </div>
              {user.bio && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-500 block mb-2">Bio</label>
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{user.bio}</p>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-brand-600" />
                Location Information
              </h2>
              {user.address || locationNames.country || locationNames.state || locationNames.city ? (
                <div className="space-y-4">
                  {user.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Street Address</label>
                      <p className="text-gray-900">{user.address}</p>
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
            {user.resume_path && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaFileAlt className="text-brand-600" />
                  Resume
                </h2>
                <a
                  href={`${API_URL}/${user.resume_path}`}
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
                  {(() => {
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
                    return `${completedFields} of ${fields.length} fields completed`;
                  })()}
                </div>
                {profileCompletion < 100 && (
                  <Link
                    href="/profile"
                    className="block w-full mt-4 text-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium text-sm"
                  >
                    Complete Your Profile
                  </Link>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verification</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.is_verified
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.is_verified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {new Date(user.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {user.managed_spa_id && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Managed SPA ID</span>
                    <span className="text-sm text-gray-900 font-medium">#{user.managed_spa_id}</span>
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
