'use client';

import { FaSearch } from 'react-icons/fa';
import { Country, State, City } from '@/lib/location';

type LocationType = 'countries' | 'states' | 'cities' | 'areas';

interface LocationFiltersProps {
  activeTab: LocationType;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  countries: Country[];
  states: State[];
  cities: City[];
  selectedCountryId: number | null;
  selectedStateId: number | null;
  selectedCityId: number | null;
  onCountryChange: (id: number | null) => void;
  onStateChange: (id: number | null) => void;
  onCityChange: (id: number | null) => void;
  filteredCount: number;
  totalCount: number;
}

export default function LocationFilters({
  activeTab,
  searchTerm,
  onSearchChange,
  countries,
  states,
  cities,
  selectedCountryId,
  selectedStateId,
  selectedCityId,
  onCountryChange,
  onStateChange,
  onCityChange,
  filteredCount,
  totalCount,
}: LocationFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200 mb-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative md:col-span-2 lg:col-span-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              <FaSearch size={16} />
            </div>
          </div>
          <input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
          />
        </div>

        {/* Filters */}
        {activeTab === 'states' && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Filter by Country</label>
            <select
              value={selectedCountryId || ''}
              onChange={(e) => onCountryChange(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
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
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Filter by Country</label>
              <select
                value={selectedCountryId || ''}
                onChange={(e) => {
                  onCountryChange(e.target.value ? parseInt(e.target.value) : null);
                  onStateChange(null);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
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
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Filter by State</label>
              <select
                value={selectedStateId || ''}
                onChange={(e) => onStateChange(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
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
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Filter by City</label>
            <select
              value={selectedCityId || ''}
              onChange={(e) => onCityChange(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
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
      <div className="mt-3 text-xs sm:text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{filteredCount}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalCount}</span> {activeTab}
      </div>
    </div>
  );
}

