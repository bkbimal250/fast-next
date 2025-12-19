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

  const handleSubmit = async (e: React.FormEvent) => {
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
      setTimeout(() => {
        router.push('/dashboard/locations');
      }, 1500);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New {typeName}</h1>
            <p className="text-gray-600 mt-2">Add a new {type.slice(0, -1)} to the system</p>
          </div>
          <Link href="/dashboard/locations" className="btn-secondary">
            Back to Locations
          </Link>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
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

          {type === 'states' && (
            <div>
              <label htmlFor="country_id" className="block text-sm font-medium text-gray-700">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                id="country_id"
                name="country_id"
                value={formData.country_id}
                onChange={handleChange}
                className="input-field"
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
                <label htmlFor="country_id" className="block text-sm font-medium text-gray-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  id="country_id"
                  name="country_id"
                  value={formData.country_id}
                  onChange={handleChange}
                  className="input-field"
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
                <label htmlFor="state_id" className="block text-sm font-medium text-gray-700">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  id="state_id"
                  name="state_id"
                  value={formData.state_id}
                  onChange={handleChange}
                  className="input-field"
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
              <label htmlFor="city_id" className="block text-sm font-medium text-gray-700">
                City <span className="text-red-500">*</span>
              </label>
              <select
                id="city_id"
                name="city_id"
                value={formData.city_id}
                onChange={handleChange}
                className="input-field"
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

          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : `Create ${typeName}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

