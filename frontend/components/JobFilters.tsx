'use client';

import { useState, useEffect } from 'react';
import { jobAPI, JobType, JobCategory } from '@/lib/job';
import { locationAPI } from '@/lib/location';

interface JobFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

interface FilterState {
  jobTypeId?: number;
  jobCategoryId?: number;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  areaId?: number;
  salaryMin?: number;
  salaryMax?: number;
  experienceMin?: number;
  experienceMax?: number;
  isFeatured?: boolean;
}

export default function JobFilters({ onFilterChange, initialFilters = {} }: JobFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    location: true,
    salary: true,
    experience: true,
    jobType: true,
    jobCategory: true,
  });

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    if (filters.countryId) {
      locationAPI.getStates(filters.countryId).then(setStates).catch(console.error);
      setFilters((prev) => ({ ...prev, stateId: undefined, cityId: undefined, areaId: undefined }));
      setCities([]);
      setAreas([]);
    }
  }, [filters.countryId]);

  useEffect(() => {
    if (filters.stateId) {
      locationAPI.getCities(filters.stateId).then(setCities).catch(console.error);
      setFilters((prev) => ({ ...prev, cityId: undefined, areaId: undefined }));
      setAreas([]);
    }
  }, [filters.stateId]);

  useEffect(() => {
    if (filters.cityId) {
      locationAPI.getAreas(filters.cityId).then(setAreas).catch(console.error);
      setFilters((prev) => ({ ...prev, areaId: undefined }));
    }
  }, [filters.cityId]);

  const fetchFilterData = async () => {
    try {
      const [typesData, categoriesData, countriesData] = await Promise.all([
        jobAPI.getJobTypes(),
        jobAPI.getJobCategories(),
        locationAPI.getCountries(),
      ]);
      setJobTypes(typesData);
      setJobCategories(categoriesData);
      setCountries(countriesData);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setStates([]);
    setCities([]);
    setAreas([]);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== null && value !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="p-4 space-y-1">
        {/* Job Type Filter */}
        <div className="border-b border-gray-100 pb-3">
          <button
            onClick={() => toggleSection('jobType')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="text-sm font-semibold text-gray-900">Job Type</span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.jobType ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.jobType && (
            <div className="mt-2 space-y-2">
              <select
                value={filters.jobTypeId || ''}
                onChange={(e) => updateFilter('jobTypeId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full input-field text-sm"
              >
                <option value="">All Job Types</option>
                {jobTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Job Category Filter */}
        <div className="border-b border-gray-100 pb-3">
          <button
            onClick={() => toggleSection('jobCategory')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="text-sm font-semibold text-gray-900">Job Category</span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.jobCategory ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.jobCategory && (
            <div className="mt-2 space-y-2">
              <select
                value={filters.jobCategoryId || ''}
                onChange={(e) => updateFilter('jobCategoryId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full input-field text-sm"
              >
                <option value="">All Categories</option>
                {jobCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Location Filter */}
        <div className="border-b border-gray-100 pb-3">
          <button
            onClick={() => toggleSection('location')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="text-sm font-semibold text-gray-900">Location</span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.location ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.location && (
            <div className="mt-2 space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Country</label>
                <select
                  value={filters.countryId || ''}
                  onChange={(e) => updateFilter('countryId', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full input-field text-sm"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              {filters.countryId && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">State</label>
                  <select
                    value={filters.stateId || ''}
                    onChange={(e) => updateFilter('stateId', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full input-field text-sm"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {filters.stateId && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">City</label>
                  <select
                    value={filters.cityId || ''}
                    onChange={(e) => updateFilter('cityId', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full input-field text-sm"
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
              {filters.cityId && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Area</label>
                  <select
                    value={filters.areaId || ''}
                    onChange={(e) => updateFilter('areaId', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full input-field text-sm"
                  >
                    <option value="">Select Area</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Salary Filter */}
        <div className="border-b border-gray-100 pb-3">
          <button
            onClick={() => toggleSection('salary')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="text-sm font-semibold text-gray-900">Salary (₹)</span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.salary ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.salary && (
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Min</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.salaryMin || ''}
                    onChange={(e) => updateFilter('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Max</label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={filters.salaryMax || ''}
                    onChange={(e) => updateFilter('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full input-field text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: '0-20k', min: 0, max: 20000 },
                  { label: '20k-40k', min: 20000, max: 40000 },
                  { label: '40k-60k', min: 40000, max: 60000 },
                  { label: '60k-1L', min: 60000, max: 100000 },
                  { label: '1L+', min: 100000, max: undefined },
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      updateFilter('salaryMin', range.min);
                      updateFilter('salaryMax', range.max);
                    }}
                    className={`text-xs px-2.5 py-1 rounded border ${
                      filters.salaryMin === range.min && filters.salaryMax === range.max
                        ? 'bg-brand-50 border-brand-500 text-brand-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    ₹{range.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Experience Filter */}
        <div className="border-b border-gray-100 pb-3">
          <button
            onClick={() => toggleSection('experience')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="text-sm font-semibold text-gray-900">Experience</span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.experience ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.experience && (
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Min (Years)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.experienceMin || ''}
                    onChange={(e) => updateFilter('experienceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Max (Years)</label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={filters.experienceMax || ''}
                    onChange={(e) => updateFilter('experienceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full input-field text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: '0-1', min: 0, max: 1 },
                  { label: '1-3', min: 1, max: 3 },
                  { label: '3-5', min: 3, max: 5 },
                  { label: '5-10', min: 5, max: 10 },
                  { label: '10+', min: 10, max: undefined },
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      updateFilter('experienceMin', range.min);
                      updateFilter('experienceMax', range.max);
                    }}
                    className={`text-xs px-2.5 py-1 rounded border ${
                      filters.experienceMin === range.min && filters.experienceMax === range.max
                        ? 'bg-brand-50 border-brand-500 text-brand-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {range.label} {range.max ? 'years' : '+'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Featured Jobs Filter */}
        <div className="pb-2">
          <label className="flex items-center py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.isFeatured === true}
              onChange={(e) => updateFilter('isFeatured', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="ml-2 text-sm text-gray-700 font-medium">Featured Jobs Only</span>
          </label>
        </div>
      </div>
    </div>
  );
}
