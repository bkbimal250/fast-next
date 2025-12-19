'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, UserCreate } from '@/lib/user';
import { locationAPI, Country, State, City } from '@/lib/location';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function CreateUserPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Location data
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Form state
  const [formData, setFormData] = useState<UserCreate>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    is_active: true,
    is_verified: false,
  });

  const [locationData, setLocationData] = useState({
    country_id: '',
    state_id: '',
    city_id: '',
    address: '',
    bio: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
    }
    locationAPI.getCountries().then(setCountries).catch(console.error);
  }, [user, router]);

  useEffect(() => {
    if (locationData.country_id) {
      locationAPI.getStates(parseInt(locationData.country_id)).then(setStates).catch(console.error);
    } else {
      setStates([]);
    }
  }, [locationData.country_id]);

  useEffect(() => {
    if (locationData.state_id) {
      locationAPI.getCities(parseInt(locationData.state_id), parseInt(locationData.country_id)).then(setCities).catch(console.error);
    } else {
      setCities([]);
    }
  }, [locationData.state_id, locationData.country_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name in formData) {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    } else {
      setLocationData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const userData: UserCreate & { bio?: string; address?: string; country_id?: number; state_id?: number; city_id?: number } = {
        ...formData,
        password: formData.password, // Required field
      };

      // Add location data if provided
      if (locationData.bio) userData.bio = locationData.bio;
      if (locationData.address) userData.address = locationData.address;
      if (locationData.country_id) userData.country_id = parseInt(locationData.country_id);
      if (locationData.state_id) userData.state_id = parseInt(locationData.state_id);
      if (locationData.city_id) userData.city_id = parseInt(locationData.city_id);

      const createdUser = await userAPI.createUser(userData);
      setSuccess('User created successfully!');
      
      // Stay on page to allow creating another user
      setTimeout(() => {
        setSuccess(null);
        // Optionally reset form
        // setFormData({ name: '', email: '', phone: '', password: '', role: 'user', is_active: true, is_verified: false });
        // router.push(`/dashboard/users/${createdUser.id}/edit`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create user');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
            <p className="text-gray-600 mt-2">Add a new user to the system</p>
          </div>
          <Link href="/dashboard/users" className="btn-secondary">
            Back to Users
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
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
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  required
                  minLength={6}
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information (Optional)</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={locationData.bio}
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
                  value={locationData.address}
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
                    value={locationData.country_id}
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
                    value={locationData.state_id}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!locationData.country_id}
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
                    value={locationData.city_id}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!locationData.state_id}
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

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Link href="/dashboard/users" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

