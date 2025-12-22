'use client';

import { useState, useEffect } from 'react';
import { Country, State, City } from '@/lib/location';
import { locationAPI } from '@/lib/location';

type LocationType = 'countries' | 'states' | 'cities' | 'areas';

interface LocationCreateFormProps {
  activeTab: LocationType;
  show: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    country_id?: number;
    state_id?: number;
    city_id?: number;
  }) => Promise<void>;
  initialData?: {
    country_id?: number;
    state_id?: number;
    city_id?: number;
  };
}

export default function LocationCreateForm({
  activeTab,
  show,
  onClose,
  onSubmit,
  initialData,
}: LocationCreateFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    country_id: initialData?.country_id?.toString() || '',
    state_id: initialData?.state_id?.toString() || '',
    city_id: initialData?.city_id?.toString() || '',
  });
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show && (activeTab === 'states' || activeTab === 'cities')) {
      locationAPI.getCountries().then(setCountries).catch(console.error);
    }
  }, [show, activeTab]);

  useEffect(() => {
    if (show && activeTab === 'cities' && formData.country_id) {
      locationAPI.getStates(parseInt(formData.country_id)).then(setStates).catch(console.error);
    }
  }, [show, activeTab, formData.country_id]);

  useEffect(() => {
    if (show && activeTab === 'areas') {
      locationAPI.getCities().then(setCities).catch(console.error);
    }
  }, [show, activeTab]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: '',
        country_id: initialData.country_id?.toString() || '',
        state_id: initialData.state_id?.toString() || '',
        city_id: initialData.city_id?.toString() || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'country_id') {
        newData.state_id = '';
        newData.city_id = '';
      } else if (name === 'state_id') {
        newData.city_id = '';
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent, saveAndAddAnother: boolean = false) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        name: formData.name,
        country_id: formData.country_id ? parseInt(formData.country_id) : undefined,
        state_id: formData.state_id ? parseInt(formData.state_id) : undefined,
        city_id: formData.city_id ? parseInt(formData.city_id) : undefined,
      });
      
      if (saveAndAddAnother) {
        // Reset only the name field, keep parent selections
        setFormData({
          name: '',
          country_id: formData.country_id,
          state_id: formData.state_id,
          city_id: formData.city_id,
        });
      } else {
        // Reset all fields and close form
        setFormData({
          name: '',
          country_id: initialData?.country_id?.toString() || '',
          state_id: initialData?.state_id?.toString() || '',
          city_id: initialData?.city_id?.toString() || '',
        });
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-5 border-2 border-brand-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Add New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white"
              required
              autoFocus
            />
          </div>

          {activeTab === 'states' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <select
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

          {activeTab === 'cities' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="state_id"
                  value={formData.state_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white"
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

          {activeTab === 'areas' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <select
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
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save & Add Another'}
          </button>
          <button
            type="submit"
            onClick={(e) => handleSubmit(e, false)}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

