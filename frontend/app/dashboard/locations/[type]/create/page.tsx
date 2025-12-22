'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { locationAPI, Country, State, City } from '@/lib/location';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type LocationType = 'countries' | 'states' | 'cities' | 'areas';

export default function CreateLocationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const type = (params?.type as LocationType) || 'countries';

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Location data for dropdowns
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    country_id: '',
    state_id: '',
    city_id: '',
  });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      router.push('/dashboard');
    }

    // Load required data
    if (type === 'states' || type === 'cities') {
      locationAPI.getCountries().then(setCountries).catch(console.error);
    }
    if (type === 'cities') {
      if (formData.country_id) {
        locationAPI.getStates(parseInt(formData.country_id)).then(setStates).catch(console.error);
      }
    }
    if (type === 'areas') {
      locationAPI.getCities().then(setCities).catch(console.error);
    }
  }, [user, router, type, formData.country_id]);

  useEffect(() => {
    if (type === 'cities' && formData.country_id) {
      locationAPI.getStates(parseInt(formData.country_id)).then(setStates).catch(console.error);
      setFormData((prev) => ({ ...prev, state_id: '' }));
    }
  }, [formData.country_id, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, saveAndAddAnother: boolean = false) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      switch (type) {
        case 'countries':
          await locationAPI.createCountry({ name: formData.name });
          break;
        case 'states':
          await locationAPI.createState({
            name: formData.name,
            country_id: parseInt(formData.country_id),
          });
          break;
        case 'cities':
          await locationAPI.createCity({
            name: formData.name,
            state_id: parseInt(formData.state_id),
            country_id: parseInt(formData.country_id),
          });
          break;
        case 'areas':
          await locationAPI.createArea({
            name: formData.name,
            city_id: parseInt(formData.city_id),
          });
          break;
      }
      setSuccess(`${type.slice(0, -1)} created successfully!`);
      
      if (saveAndAddAnother) {
        // Reset form but keep parent selections
        setFormData({
          name: '',
          country_id: formData.country_id,
          state_id: formData.state_id,
          city_id: formData.city_id,
        });
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setTimeout(() => {
          router.push('/dashboard/locations');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to create ${type.slice(0, -1)}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const typeName = type.slice(0, -1).charAt(0).toUpperCase() + type.slice(0, -1).slice(1);

  return (
    <div className="min-h-screen bg-surface-light">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New {typeName}</h1>
            <p className="text-gray-600 mt-2">Add a new {type.slice(0, -1)} to the system</p>
          </div>
          <Link 
            href="/dashboard/locations" 
            className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            ← Back to Locations
          </Link>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-5 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
            <p className="font-medium">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white"
              required
              autoFocus
            />
          </div>

          {type === 'states' && (
            <div>
              <label htmlFor="country_id" className="block text-sm font-semibold text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                id="country_id"
                name="country_id"
                value={formData.country_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white"
                required
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === 'cities' && (
            <>
              <div>
                <label htmlFor="country_id" className="block text-sm font-semibold text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  id="country_id"
                  name="country_id"
                  value={formData.country_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white"
                  required
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
                <label htmlFor="state_id" className="block text-sm font-semibold text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  id="state_id"
                  name="state_id"
                  value={formData.state_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={!formData.country_id}
                >
                  <option value="">Select State</option>
                  {states
                    .filter((s) => s.country_id === parseInt(formData.country_id))
                    .map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                </select>
              </div>
            </>
          )}

          {type === 'areas' && (
            <div>
              <label htmlFor="city_id" className="block text-sm font-semibold text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <select
                id="city_id"
                name="city_id"
                value={formData.city_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white"
                required
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <Link
              href="/dashboard/locations"
              className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save & Add Another'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}

