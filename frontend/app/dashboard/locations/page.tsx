'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { locationAPI, Country, State, City, Area } from '@/lib/location';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

type LocationType = 'countries' | 'states' | 'cities' | 'areas';

export default function LocationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LocationType>('countries');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  // Filter states
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  // Inline form state
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [inlineFormData, setInlineFormData] = useState({
    name: '',
    country_id: '',
    state_id: '',
    city_id: '',
  });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      router.push('/dashboard');
    } else {
      fetchData();
    }
  }, [user, router, activeTab, selectedCountryId, selectedStateId, selectedCityId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'countries':
          setCountries(await locationAPI.getCountries());
          break;
        case 'states':
          setStates(await locationAPI.getStates(selectedCountryId || undefined));
          break;
        case 'cities':
          setCities(await locationAPI.getCities(selectedStateId || undefined, selectedCountryId || undefined));
          break;
        case 'areas':
          setAreas(await locationAPI.getAreas(selectedCityId || undefined));
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch locations');
      console.error('Failed to fetch locations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load countries for inline form
  useEffect(() => {
    if (showInlineForm && (activeTab === 'states' || activeTab === 'cities')) {
      locationAPI.getCountries().then(setCountries).catch(console.error);
    }
  }, [showInlineForm, activeTab]);

  // Load states when country is selected in inline form
  useEffect(() => {
    if (showInlineForm && activeTab === 'cities' && inlineFormData.country_id) {
      locationAPI.getStates(parseInt(inlineFormData.country_id)).then(setStates).catch(console.error);
    }
  }, [showInlineForm, activeTab, inlineFormData.country_id]);

  // Load cities for areas
  useEffect(() => {
    if (showInlineForm && activeTab === 'areas') {
      locationAPI.getCities().then(setCities).catch(console.error);
    }
  }, [showInlineForm, activeTab]);

  const handleInlineFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInlineFormData((prev) => {
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

  const handleInlineSubmit = async (saveAndAddAnother: boolean = false) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      switch (activeTab) {
        case 'countries':
          await locationAPI.createCountry({ name: inlineFormData.name });
          break;
        case 'states':
          await locationAPI.createState({
            name: inlineFormData.name,
            country_id: parseInt(inlineFormData.country_id),
          });
          break;
        case 'cities':
          await locationAPI.createCity({
            name: inlineFormData.name,
            state_id: parseInt(inlineFormData.state_id),
            country_id: parseInt(inlineFormData.country_id),
          });
          break;
        case 'areas':
          await locationAPI.createArea({
            name: inlineFormData.name,
            city_id: parseInt(inlineFormData.city_id),
          });
          break;
      }

      setSuccess(`${activeTab.slice(0, -1)} created successfully!`);
      
      // Refresh data
      await fetchData();

      if (saveAndAddAnother) {
        // Clear form but keep it open
        setInlineFormData({
          name: '',
          country_id: inlineFormData.country_id, // Keep parent selection
          state_id: inlineFormData.state_id,
          city_id: inlineFormData.city_id,
        });
        setSuccess(`${activeTab.slice(0, -1)} created! Add another?`);
      } else {
        // Close form and clear
        setShowInlineForm(false);
        setInlineFormData({
          name: '',
          country_id: '',
          state_id: '',
          city_id: '',
        });
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to create ${activeTab.slice(0, -1)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type: LocationType, id: number) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}? This action cannot be undone.`)) {
      return;
    }

    try {
      switch (type) {
        case 'countries':
          await locationAPI.deleteCountry(id);
          setCountries(countries.filter((c) => c.id !== id));
          break;
        case 'states':
          await locationAPI.deleteState(id);
          setStates(states.filter((s) => s.id !== id));
          break;
        case 'cities':
          await locationAPI.deleteCity(id);
          setCities(cities.filter((c) => c.id !== id));
          break;
        case 'areas':
          await locationAPI.deleteArea(id);
          setAreas(areas.filter((a) => a.id !== id));
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to delete ${type.slice(0, -1)}`);
      console.error(`Failed to delete ${type}:`, err);
    }
  };

  if (loading && countries.length === 0 && states.length === 0 && cities.length === 0 && areas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Location Management</h1>
            <p className="text-gray-600 mt-2">Manage countries, states, cities, and areas</p>
          </div>
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {(['countries', 'states', 'cities', 'areas'] as LocationType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedCountryId(null);
                    setSelectedStateId(null);
                    setSelectedCityId(null);
                    setShowInlineForm(false);
                    setInlineFormData({ name: '', country_id: '', state_id: '', city_id: '' });
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters */}
        {activeTab !== 'countries' && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeTab === 'states' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Country</label>
                  <select
                    value={selectedCountryId || ''}
                    onChange={(e) => setSelectedCountryId(e.target.value ? parseInt(e.target.value) : null)}
                    className="input-field"
                  >
                    <option value="">All Countries</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {activeTab === 'cities' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Country</label>
                    <select
                      value={selectedCountryId || ''}
                      onChange={(e) => {
                        setSelectedCountryId(e.target.value ? parseInt(e.target.value) : null);
                        setSelectedStateId(null);
                      }}
                      className="input-field"
                    >
                      <option value="">All Countries</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by State</label>
                    <select
                      value={selectedStateId || ''}
                      onChange={(e) => setSelectedStateId(e.target.value ? parseInt(e.target.value) : null)}
                      className="input-field"
                      disabled={!selectedCountryId}
                    >
                      <option value="">All States</option>
                      {states
                        .filter((s) => !selectedCountryId || s.country_id === selectedCountryId)
                        .map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}
              {activeTab === 'areas' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by City</label>
                  <select
                    value={selectedCityId || ''}
                    onChange={(e) => setSelectedCityId(e.target.value ? parseInt(e.target.value) : null)}
                    className="input-field"
                  >
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inline Create Form */}
        {showInlineForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-2 border-primary-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
              </h3>
              <button
                onClick={() => {
                  setShowInlineForm(false);
                  setInlineFormData({ name: '', country_id: '', state_id: '', city_id: '' });
                  setError(null);
                  setSuccess(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleInlineSubmit(false);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={inlineFormData.name}
                    onChange={handleInlineFormChange}
                    className="input-field"
                    required
                    autoFocus
                  />
                </div>

                {activeTab === 'states' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="country_id"
                      value={inlineFormData.country_id}
                      onChange={handleInlineFormChange}
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

                {activeTab === 'cities' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="country_id"
                        value={inlineFormData.country_id}
                        onChange={handleInlineFormChange}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="state_id"
                        value={inlineFormData.state_id}
                        onChange={handleInlineFormChange}
                        className="input-field"
                        required
                        disabled={!inlineFormData.country_id}
                      >
                        <option value="">Select State</option>
                        {states
                          .filter((s) => s.country_id === parseInt(inlineFormData.country_id))
                          .map((state) => (
                            <option key={state.id} value={state.id}>
                              {state.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </>
                )}

                {activeTab === 'areas' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="city_id"
                      value={inlineFormData.city_id}
                      onChange={handleInlineFormChange}
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
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowInlineForm(false);
                    setInlineFormData({ name: '', country_id: '', state_id: '', city_id: '' });
                    setError(null);
                    setSuccess(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleInlineSubmit(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save & Add Another'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <div className="flex space-x-3">
                {!showInlineForm && (
                  <button
                    onClick={() => {
                      setShowInlineForm(true);
                      setError(null);
                      setSuccess(null);
                      setInlineFormData({
                        name: '',
                        country_id: selectedCountryId?.toString() || '',
                        state_id: selectedStateId?.toString() || '',
                        city_id: selectedCityId?.toString() || '',
                      });
                    }}
                    className="btn-primary"
                  >
                    + Quick Add
                  </button>
                )}
                <Link href={`/dashboard/locations/${activeTab}/create`} className="btn-secondary">
                  Full Form
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      {activeTab === 'states' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Country
                        </th>
                      )}
                      {activeTab === 'cities' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            State
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Country
                          </th>
                        </>
                      )}
                      {activeTab === 'areas' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          City
                        </th>
                      )}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeTab === 'countries' &&
                      countries.map((country) => (
                        <tr key={country.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{country.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {country.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/dashboard/locations/countries/${country.id}/edit`}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              Edit
                            </Link>
                            {user.role === 'admin' && (
                              <button
                                onClick={() => handleDelete('countries', country.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    {activeTab === 'states' &&
                      states.map((state) => (
                        <tr key={state.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{state.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {state.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {state.country?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/dashboard/locations/states/${state.id}/edit`}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              Edit
                            </Link>
                            {user.role === 'admin' && (
                              <button
                                onClick={() => handleDelete('states', state.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    {activeTab === 'cities' &&
                      cities.map((city) => (
                        <tr key={city.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{city.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {city.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {city.state?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {city.country?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/dashboard/locations/cities/${city.id}/edit`}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              Edit
                            </Link>
                            {user.role === 'admin' && (
                              <button
                                onClick={() => handleDelete('cities', city.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    {activeTab === 'areas' &&
                      areas.map((area) => (
                        <tr key={area.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{area.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {area.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {area.city?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/dashboard/locations/areas/${area.id}/edit`}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              Edit
                            </Link>
                            {user.role === 'admin' && (
                              <button
                                onClick={() => handleDelete('areas', area.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {((activeTab === 'countries' && countries.length === 0) ||
                  (activeTab === 'states' && states.length === 0) ||
                  (activeTab === 'cities' && cities.length === 0) ||
                  (activeTab === 'areas' && areas.length === 0)) && (
                  <div className="text-center py-12 text-gray-500">No {activeTab} found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

