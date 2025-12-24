'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { locationAPI, Country, State, City, Area } from '@/lib/location';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type LocationType = 'countries' | 'states' | 'cities' | 'areas';

export default function EditLocationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const type = (params?.type as LocationType) || 'countries';
  const id = params?.id ? parseInt(params.id as string) : null;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Location data for dropdowns
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Current location data
  const [currentData, setCurrentData] = useState<Country | State | City | Area | null>(null);

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
      return;
    }

    if (id) {
      fetchLocation();
    }

    // Load required data for dropdowns
    if (type === 'states' || type === 'cities') {
      locationAPI.getCountries().then(setCountries).catch(console.error);
    }
    if (type === 'areas') {
      locationAPI.getCities().then(setCities).catch(console.error);
    }
  }, [user, router, type, id]);

  // Load states when country is selected or current data changes
  useEffect(() => {
    if ((type === 'cities' || type === 'states') && formData.country_id) {
      locationAPI.getStates(parseInt(formData.country_id)).then(setStates).catch(console.error);
    } else {
      setStates([]);
    }
  }, [formData.country_id, type]);

  const fetchLocation = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      let data;
      switch (type) {
        case 'countries':
          data = await locationAPI.getCountryById(id);
          setFormData({ name: data.name, country_id: '', state_id: '', city_id: '' });
          break;
        case 'states':
          data = await locationAPI.getStateById(id);
          setFormData({
            name: data.name,
            country_id: data.country_id.toString(),
            state_id: '',
            city_id: '',
          });
          break;
        case 'cities':
          data = await locationAPI.getCityById(id);
          setFormData({
            name: data.name,
            country_id: data.country_id.toString(),
            state_id: data.state_id.toString(),
            city_id: '',
          });
          break;
        case 'areas':
          data = await locationAPI.getAreaById(id);
          setFormData({
            name: data.name,
            country_id: '',
            state_id: '',
            city_id: data.city_id.toString(),
          });
          break;
      }
      setCurrentData(data);
      setLastUpdated(null); // Reset on initial load
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch location');
      console.error('Failed to fetch location:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Reset dependent fields
      if (name === 'country_id') {
        newData.state_id = '';
        newData.city_id = '';
      } else if (name === 'state_id') {
        newData.city_id = '';
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let updatedData: Country | State | City | Area | undefined;
      switch (type) {
        case 'countries':
          updatedData = await locationAPI.updateCountry(id, { name: formData.name });
          break;
        case 'states':
          updatedData = await locationAPI.updateState(id, {
            name: formData.name,
            country_id: parseInt(formData.country_id),
          });
          break;
        case 'cities':
          updatedData = await locationAPI.updateCity(id, {
            name: formData.name,
            state_id: parseInt(formData.state_id),
            country_id: parseInt(formData.country_id),
          });
          break;
        case 'areas':
          updatedData = await locationAPI.updateArea(id, {
            name: formData.name,
            city_id: parseInt(formData.city_id),
          });
          break;
      }
      
      // Update current data state with the response
      if (updatedData) {
        setCurrentData(updatedData);
        
        // Sync form data with updated response to ensure consistency
        const newFormData: typeof formData = {
          name: updatedData.name || formData.name,
          country_id: '',
          state_id: '',
          city_id: '',
        };
        
        // Update based on type
        if (type === 'states' && 'country_id' in updatedData) {
          newFormData.country_id = (updatedData as State).country_id.toString();
        } else if (type === 'cities' && 'country_id' in updatedData && 'state_id' in updatedData) {
          const cityData = updatedData as City;
          newFormData.country_id = cityData.country_id.toString();
          newFormData.state_id = cityData.state_id.toString();
        } else if (type === 'areas' && 'city_id' in updatedData) {
          newFormData.city_id = (updatedData as Area).city_id.toString();
        }
        
        setFormData(newFormData);
        
        // If country changed for cities, reload states dropdown
        if (type === 'cities' && updatedData && 'country_id' in updatedData) {
          const cityData = updatedData as City;
          const newCountryId = cityData.country_id;
          if (newCountryId && newCountryId.toString() !== formData.country_id) {
            locationAPI.getStates(newCountryId).then(setStates).catch(console.error);
          }
        }
      }
      
      // Update last updated timestamp
      setLastUpdated(new Date());
      
      // Show success message
      setSuccess(`${type.slice(0, -1)} updated successfully!`);
      
      // Clear success message after 5 seconds but stay on page
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to update ${type.slice(0, -1)}`);
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

  if (error && !currentData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/dashboard/locations" className="btn-primary inline-block">
              Back to Locations
            </Link>
          </div>
        </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Edit {typeName}</h1>
            <p className="text-gray-600 mt-2">
              {currentData ? (
                <>
                  Editing: <span className="font-semibold text-gray-900">{currentData.name}</span>
                </>
              ) : (
                `Update ${type.slice(0, -1)} information`
              )}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard/locations" className="btn-secondary">
              View All {typeName}s
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 ml-4"
            >
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
            <button
              onClick={() => setSuccess(null)}
              className="text-green-700 hover:text-green-900 ml-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

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
              <Link href="/dashboard/locations" className="btn-secondary">
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
                  `Update ${typeName}`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

