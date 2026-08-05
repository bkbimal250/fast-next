'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FaBriefcase,
  FaChevronDown,
  FaChevronUp,
  FaCrosshairs,
  FaFilter,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaStar,
  FaTags,
  FaTimes,
  FaUserTie,
} from 'react-icons/fa';
import SearchableSelect from '@/components/SearchableSelect';
import { useLocation } from '@/hooks/useLocation';
import { jobAPI, JobCategory, JobType } from '@/lib/job';
import { locationAPI } from '@/lib/location';

interface JobFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  onClose?: () => void;
  compact?: boolean;
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

const salaryRanges = [
  { label: '0-20k', min: 0, max: 20000 },
  { label: '20k-40k', min: 20000, max: 40000 },
  { label: '40k-60k', min: 40000, max: 60000 },
  { label: '60k-1L', min: 60000, max: 100000 },
  { label: '1L+', min: 100000, max: undefined },
];

const experienceRanges = [
  { label: '0-1 yr', min: 0, max: 1 },
  { label: '1-3 yrs', min: 1, max: 3 },
  { label: '3-5 yrs', min: 3, max: 5 },
  { label: '5-10 yrs', min: 5, max: 10 },
  { label: '10+ yrs', min: 10, max: undefined },
];

export default function JobFilters({
  onFilterChange,
  initialFilters = {},
  onClose,
  compact = false,
}: JobFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    jobType: true,
    jobCategory: true,
    location: false,
    salary: true,
    experience: false,
  });
  const [useNearMe, setUseNearMe] = useState(false);
  const { location: userLocation, loading: locationLoading } = useLocation(false);

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    if (filters.countryId) {
      locationAPI.getStates(filters.countryId, 0, 1000).then(setStates).catch(console.error);
      setFilters((prev) => ({ ...prev, stateId: undefined, cityId: undefined, areaId: undefined }));
      setCities([]);
      setAreas([]);
    }
  }, [filters.countryId]);

  useEffect(() => {
    if (filters.stateId) {
      locationAPI.getCities(filters.stateId, undefined, 0, 1000).then(setCities).catch(console.error);
      setFilters((prev) => ({ ...prev, cityId: undefined, areaId: undefined }));
      setAreas([]);
    }
  }, [filters.stateId]);

  useEffect(() => {
    if (filters.cityId) {
      locationAPI.getAreas(filters.cityId, 0, 1000).then(setAreas).catch(console.error);
      setFilters((prev) => ({ ...prev, areaId: undefined }));
    }
  }, [filters.cityId]);

  const fetchFilterData = async () => {
    try {
      const [typesData, categoriesData, countriesData] = await Promise.all([
        jobAPI.getJobTypes(0, 1000),
        jobAPI.getJobCategories(0, 1000),
        locationAPI.getCountries(0, 1000),
      ]);

      setJobTypes(typesData);
      setJobCategories(categoriesData);
      setCountries(countriesData);

      const india = countriesData.find((country: any) => country.name.toLowerCase() === 'india');
      if (india && !filters.countryId && !initialFilters?.countryId) {
        const newFilters = { ...filters, countryId: india.id };
        setFilters(newFilters);
        onFilterChange(newFilters);
        locationAPI.getStates(india.id, 0, 1000).then(setStates).catch(console.error);
      }
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  const updateFilters = (nextFilters: FilterState) => {
    setFilters(nextFilters);
    onFilterChange(nextFilters);
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    updateFilters({ ...filters, [key]: value || undefined });
  };

  const applySalaryRange = (min: number, max?: number) => {
    updateFilters({ ...filters, salaryMin: min, salaryMax: max });
  };

  const applyExperienceRange = (min: number, max?: number) => {
    updateFilters({ ...filters, experienceMin: min, experienceMax: max });
  };

  const clearFilters = () => {
    setUseNearMe(false);
    updateFilters({});
    setStates([]);
    setCities([]);
    setAreas([]);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const activeCount = useMemo(() => {
    return Object.values(filters).filter((value) => value !== undefined && value !== null && value !== '').length;
  }, [filters]);

  const hasActiveFilters = activeCount > 0;

  const sectionClass = 'overflow-visible rounded-lg border border-slate-200 bg-white';
  const sectionButtonClass =
    'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50';
  const labelClass = 'text-[11px] font-semibold uppercase text-slate-500';
  const inputClass =
    'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
  const chipClass =
    'rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700';
  const activeChipClass = 'border-brand-600 bg-brand-700 text-white hover:bg-brand-700 hover:text-white';

  return (
    <aside className={`overflow-visible rounded-xl border border-slate-200 bg-slate-50 shadow-sm ${compact ? 'max-w-sm' : ''}`}>
      <div className="flex items-center justify-between gap-3 rounded-t-xl bg-brand-700 px-3 py-3 text-white">
        <div className="flex min-w-0 items-center gap-2">
          <FaFilter size={15} />
          <div>
            <h3 className="text-sm font-bold leading-tight">Filters</h3>
            <p className="text-[11px] text-white/75">
              {hasActiveFilters ? `${activeCount} active` : 'Refine jobs'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md bg-white/15 px-2 py-1 text-xs font-semibold text-white transition hover:bg-white/25"
            >
              Clear
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white/15 p-2 text-white transition hover:bg-white/25"
              aria-label="Hide filters"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 p-2.5">
        <div className={sectionClass}>
          <button type="button" onClick={() => toggleSection('jobType')} className={sectionButtonClass}>
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <FaBriefcase className="text-brand-700" size={14} />
              Job Type
            </span>
            {expandedSections.jobType ? <FaChevronUp className="text-slate-500" size={12} /> : <FaChevronDown className="text-slate-500" size={12} />}
          </button>
          {expandedSections.jobType && (
            <div className="border-t border-slate-100 p-2.5">
              <select
                value={filters.jobTypeId || ''}
                onChange={(event) => updateFilter('jobTypeId', event.target.value ? parseInt(event.target.value) : undefined)}
                className={inputClass}
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

        <div className={sectionClass}>
          <button type="button" onClick={() => toggleSection('jobCategory')} className={sectionButtonClass}>
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <FaTags className="text-brand-700" size={14} />
              Category
            </span>
            {expandedSections.jobCategory ? <FaChevronUp className="text-slate-500" size={12} /> : <FaChevronDown className="text-slate-500" size={12} />}
          </button>
          {expandedSections.jobCategory && (
            <div className="border-t border-slate-100 p-2.5">
              <select
                value={filters.jobCategoryId || ''}
                onChange={(event) => updateFilter('jobCategoryId', event.target.value ? parseInt(event.target.value) : undefined)}
                className={inputClass}
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

        <div className={sectionClass}>
          <button type="button" onClick={() => toggleSection('location')} className={sectionButtonClass}>
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <FaMapMarkerAlt className="text-brand-700" size={14} />
              Location
            </span>
            {expandedSections.location ? <FaChevronUp className="text-slate-500" size={12} /> : <FaChevronDown className="text-slate-500" size={12} />}
          </button>
          {expandedSections.location && (
            <div className="space-y-2.5 border-t border-slate-100 p-2.5">
              <button
                type="button"
                onClick={() => {
                  if (!useNearMe && userLocation) {
                    setUseNearMe(true);
                    const newFilters = { ...filters };
                    delete newFilters.countryId;
                    delete newFilters.stateId;
                    delete newFilters.cityId;
                    delete newFilters.areaId;
                    updateFilters(newFilters);
                  } else {
                    setUseNearMe(false);
                  }
                }}
                disabled={locationLoading}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  useNearMe
                    ? 'bg-brand-700 text-white'
                    : 'border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100'
                } ${locationLoading ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                {locationLoading ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
                ) : (
                  <FaCrosshairs size={12} />
                )}
                {useNearMe ? 'Using my location' : 'Jobs near me'}
              </button>
              {useNearMe && userLocation && (
                <p className="text-center text-xs text-slate-500">
                  Near {userLocation.city || 'your location'}
                </p>
              )}

              <div className="space-y-1.5">
                <label className={labelClass}>Country</label>
                <SearchableSelect
                  options={countries.map((country) => ({ id: country.id, name: country.name }))}
                  value={filters.countryId || null}
                  onChange={(value) => updateFilter('countryId', value || undefined)}
                  placeholder="Select country"
                />
              </div>
              {filters.countryId && (
                <div className="space-y-1.5">
                  <label className={labelClass}>State</label>
                  <SearchableSelect
                    options={states.map((state) => ({ id: state.id, name: state.name }))}
                    value={filters.stateId || null}
                    onChange={(value) => updateFilter('stateId', value || undefined)}
                    placeholder="Select state"
                  />
                </div>
              )}
              {filters.stateId && (
                <div className="space-y-1.5">
                  <label className={labelClass}>City</label>
                  <SearchableSelect
                    options={cities.map((city) => ({ id: city.id, name: city.name }))}
                    value={filters.cityId || null}
                    onChange={(value) => updateFilter('cityId', value || undefined)}
                    placeholder="Select city"
                  />
                </div>
              )}
              {filters.cityId && (
                <div className="space-y-1.5">
                  <label className={labelClass}>Area</label>
                  <SearchableSelect
                    options={areas.map((area) => ({ id: area.id, name: area.name }))}
                    value={filters.areaId || null}
                    onChange={(value) => updateFilter('areaId', value || undefined)}
                    placeholder="Select area"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className={sectionClass}>
          <button type="button" onClick={() => toggleSection('salary')} className={sectionButtonClass}>
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <FaRupeeSign className="text-brand-700" size={14} />
              Salary
            </span>
            {expandedSections.salary ? <FaChevronUp className="text-slate-500" size={12} /> : <FaChevronDown className="text-slate-500" size={12} />}
          </button>
          {expandedSections.salary && (
            <div className="space-y-2.5 border-t border-slate-100 p-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className={labelClass}>Min Rs</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.salaryMin || ''}
                    onChange={(event) => updateFilter('salaryMin', event.target.value ? parseInt(event.target.value) : undefined)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Max Rs</label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={filters.salaryMax || ''}
                    onChange={(event) => updateFilter('salaryMax', event.target.value ? parseInt(event.target.value) : undefined)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {salaryRanges.map((range) => (
                  <button
                    type="button"
                    key={range.label}
                    onClick={() => applySalaryRange(range.min, range.max)}
                    className={`${chipClass} ${
                      filters.salaryMin === range.min && filters.salaryMax === range.max ? activeChipClass : ''
                    }`}
                  >
                    Rs {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={sectionClass}>
          <button type="button" onClick={() => toggleSection('experience')} className={sectionButtonClass}>
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <FaUserTie className="text-brand-700" size={14} />
              Experience
            </span>
            {expandedSections.experience ? <FaChevronUp className="text-slate-500" size={12} /> : <FaChevronDown className="text-slate-500" size={12} />}
          </button>
          {expandedSections.experience && (
            <div className="space-y-2.5 border-t border-slate-100 p-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className={labelClass}>Min yrs</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.experienceMin || ''}
                    onChange={(event) => updateFilter('experienceMin', event.target.value ? parseInt(event.target.value) : undefined)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Max yrs</label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={filters.experienceMax || ''}
                    onChange={(event) => updateFilter('experienceMax', event.target.value ? parseInt(event.target.value) : undefined)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {experienceRanges.map((range) => (
                  <button
                    type="button"
                    key={range.label}
                    onClick={() => applyExperienceRange(range.min, range.max)}
                    className={`${chipClass} ${
                      filters.experienceMin === range.min && filters.experienceMax === range.max ? activeChipClass : ''
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <input
            type="checkbox"
            checked={filters.isFeatured === true}
            onChange={(event) => updateFilter('isFeatured', event.target.checked ? true : undefined)}
            className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
          />
          <FaStar className={filters.isFeatured ? 'text-gold-500' : 'text-slate-400'} size={13} />
          <span className="text-sm font-semibold text-slate-700">Featured only</span>
        </label>
      </div>
    </aside>
  );
}
