'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, User, UserUpdate } from '@/lib/user';
import { locationAPI, Country, State, City } from '@/lib/location';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function EditUserPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id ? parseInt(params.id as string) : null;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Location data
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Current user data
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState<UserUpdate>({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    bio: '',
    address: '',
    country_id: undefined,
    state_id: undefined,
    city_id: undefined,
    is_active: true,
    is_verified: false,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (userId) {
      fetchUser();
      locationAPI.getCountries().then(setCountries).catch(console.error);
    }
  }, [user, router, userId]);

  // Load states when country changes
  useEffect(() => {
    if (formData.country_id) {
      locationAPI.getStates(formData.country_id).then(setStates).catch(console.error);
    } else {
      setStates([]);
    }
  }, [formData.country_id]);

  // Load cities when state changes
  useEffect(() => {
    if (formData.state_id && formData.country_id) {
      locationAPI.getCities(formData.state_id, formData.country_id).then(setCities).catch(console.error);
    } else {
      setCities([]);
    }
  }, [formData.state_id, formData.country_id]);

  const fetchUser = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userAPI.getUserById(userId);
      setCurrentUser(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role,
        bio: data.bio || '',
        address: data.address || '',
        country_id: data.country_id,
        state_id: data.state_id,
        city_id: data.city_id,
        is_active: data.is_active,
        is_verified: data.is_verified,
      });
      setLastUpdated(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch user');
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: UserUpdate = {
        name: formData.name || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        role: formData.role,
        bio: formData.bio || undefined,
        address: formData.address || undefined,
        country_id: formData.country_id,
        state_id: formData.state_id,
        city_id: formData.city_id,
        is_active: formData.is_active,
        is_verified: formData.is_verified,
      };

      const updatedUser = await userAPI.updateUser(userId, updateData);
      
      // Update current user state
      if (updatedUser) {
        setCurrentUser(updatedUser);
        setLastUpdated(new Date());
      }
      
      setSuccess('User updated successfully!');
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/dashboard/users" className="btn-primary inline-block">
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600 mt-2">
              {currentUser ? (
                <>
                  Editing: <span className="font-semibold text-gray-900">{currentUser.name}</span>
                </>
              ) : (
                'Update user information'
              )}
            </p>
          </div>
          <Link href="/dashboard/users" className="btn-secondary">
            View All Users
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 ml-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </span>
            <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900 ml-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Role and Status */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Role & Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_verified"
                    checked={formData.is_verified}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Verified</span>
                </label>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={formData.bio || ''}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="country_id" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <select
                    id="country_id"
                    name="country_id"
                    value={formData.country_id || ''}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="state_id" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <select
                    id="state_id"
                    name="state_id"
                    value={formData.state_id || ''}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!formData.country_id}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="city_id" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <select
                    id="city_id"
                    name="city_id"
                    value={formData.city_id || ''}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!formData.state_id}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500">
              {lastUpdated && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Last saved: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <Link href="/dashboard/users" className="btn-secondary">
                View All
              </Link>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update User'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

