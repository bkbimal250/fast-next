'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { locationAPI, Country, State, City, Area } from '@/lib/location';
import { jobAPI } from '@/lib/job';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { FaGlobe, FaMapMarkerAlt, FaCity, FaBuilding, FaPlus } from 'react-icons/fa';
import { showToast, showErrorToast } from '@/lib/toast';
import LocationStats from './components/LocationStats';
import LocationTabs from './components/LocationTabs';
import LocationFilters from './components/LocationFilters';
import LocationCreateForm from './components/LocationCreateForm';
import LocationsTable from './components/LocationsTable';

type LocationType = 'countries' | 'states' | 'cities' | 'areas';

interface LocationJobCounts {
  [key: number]: number;
}

export default function LocationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LocationType>('countries');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Data states
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  // Job counts
  const [jobCounts, setJobCounts] = useState<LocationJobCounts>({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  // Filter states
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Inline form state
  const [showInlineForm, setShowInlineForm] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalCountries: 0,
    totalStates: 0,
    totalCities: 0,
    totalAreas: 0,
    totalJobs: 0,
  });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      router.push('/dashboard');
    } else {
      fetchData();
      fetchStats();
    }
  }, [user, router]);

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedCountryId, selectedStateId, selectedCityId]);

  useEffect(() => {
    if (activeTab === 'cities' || activeTab === 'areas' || activeTab === 'states' || activeTab === 'countries') {
      fetchJobCounts();
    }
  }, [activeTab, cities, areas, states, countries]);

  const fetchStats = async () => {
    try {
      const [countriesData, statesData, citiesData, areasData, jobCountData] = await Promise.all([
        locationAPI.getCountries(),
        locationAPI.getStates(),
        locationAPI.getCities(),
        locationAPI.getAreas(),
        jobAPI.getJobCount(),
      ]);

      setStats({
        totalCountries: countriesData.length,
        totalStates: statesData.length,
        totalCities: citiesData.length,
        totalAreas: areasData.length,
        totalJobs: jobCountData.count || 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

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

  const fetchJobCounts = async () => {
    setLoadingCounts(true);
    try {
      const counts: LocationJobCounts = {};

      if (activeTab === 'cities') {
        const cityCounts = await jobAPI.getJobCountsByLocation();
        cityCounts.forEach((item) => {
          counts[item.city_id] = item.job_count;
        });

        for (const city of cities) {
          if (!counts[city.id]) {
            try {
              const countData = await jobAPI.getJobCount({ city_id: city.id });
              counts[city.id] = countData.count;
            } catch {
              counts[city.id] = 0;
            }
          }
        }
      } else if (activeTab === 'areas') {
        for (const area of areas) {
          try {
            const countData = await jobAPI.getJobCount({ area_id: area.id });
            counts[area.id] = countData.count;
          } catch {
            counts[area.id] = 0;
          }
        }
      } else if (activeTab === 'states') {
        for (const state of states) {
          try {
            const countData = await jobAPI.getJobCount({ state_id: state.id });
            counts[state.id] = countData.count;
          } catch {
            counts[state.id] = 0;
          }
        }
      } else if (activeTab === 'countries') {
        for (const country of countries) {
          try {
            const countData = await jobAPI.getJobCount({ country_id: country.id });
            counts[country.id] = countData.count;
          } catch {
            counts[country.id] = 0;
          }
        }
      }

      setJobCounts(counts);
    } catch (err) {
      console.error('Failed to fetch job counts:', err);
    } finally {
      setLoadingCounts(false);
    }
  };

  const handleTabChange = (tab: LocationType) => {
    setActiveTab(tab);
    setSelectedCountryId(null);
    setSelectedStateId(null);
    setSelectedCityId(null);
    setSearchTerm('');
    setShowInlineForm(false);
    setError(null);
    setSuccess(null);
  };

  const handleCreateSubmit = async (data: {
    name: string;
    country_id?: number;
    state_id?: number;
    city_id?: number;
  }) => {
    setError(null);
    setSuccess(null);

    try {
      switch (activeTab) {
        case 'countries':
          await locationAPI.createCountry({ name: data.name });
          break;
        case 'states':
          if (!data.country_id) throw new Error('Country is required');
          await locationAPI.createState({
            name: data.name,
            country_id: data.country_id,
          });
          break;
        case 'cities':
          if (!data.state_id || !data.country_id) throw new Error('State and Country are required');
          await locationAPI.createCity({
            name: data.name,
            state_id: data.state_id,
            country_id: data.country_id,
          });
          break;
        case 'areas':
          if (!data.city_id) throw new Error('City is required');
          await locationAPI.createArea({
            name: data.name,
            city_id: data.city_id,
          });
          break;
      }

      const successMsg = `${activeTab.slice(0, -1)} created successfully!`;
      showToast.success(successMsg);
      setSuccess(successMsg);
      
      // Refresh all data
      await fetchData();
      await fetchStats();
      await fetchJobCounts();
      
      // Keep form open for "Save & Add Another" but reset on regular save
      // The form component handles this internally
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || `Failed to create ${activeTab.slice(0, -1)}`);
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
      await fetchStats();
      await fetchJobCounts();
      showToast.success(`${type.slice(0, -1)} deleted successfully`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || `Failed to delete ${type.slice(0, -1)}`;
      setError(errorMsg);
      showErrorToast(err, `Failed to delete ${type.slice(0, -1)}`);
      console.error(`Failed to delete ${type}:`, err);
    }
  };

  // Filter locations by search term
  const filteredLocations = useMemo(() => {
    let locations: any[] = [];
    switch (activeTab) {
      case 'countries':
        locations = countries;
        break;
      case 'states':
        locations = states;
        break;
      case 'cities':
        locations = cities;
        break;
      case 'areas':
        locations = areas;
        break;
    }

    if (!searchTerm) return locations;
    
    return locations.filter((loc) =>
      loc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, countries, states, cities, areas, searchTerm]);

  const getLocationIcon = (type: LocationType) => {
    switch (type) {
      case 'countries':
        return FaGlobe;
      case 'states':
        return FaMapMarkerAlt;
      case 'cities':
        return FaCity;
      case 'areas':
        return FaBuilding;
    }
  };

  if (loading && countries.length === 0 && states.length === 0 && cities.length === 0 && areas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return null;
  }

  const LocationIcon = getLocationIcon(activeTab);

  return (
    <div className="min-h-screen bg-surface-light">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <div className="text-brand-600">
                  <LocationIcon size={28} />
                </div>
                Location Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage countries, states, cities, and areas with job statistics
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Statistics */}
          <LocationStats stats={stats} />
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-5 bg-brand-50 border-l-4 border-brand-500 text-brand-700 p-4 rounded-lg">
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <LocationTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Filters */}
        <LocationFilters
          activeTab={activeTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          countries={countries}
          states={states}
          cities={cities}
          selectedCountryId={selectedCountryId}
          selectedStateId={selectedStateId}
          selectedCityId={selectedCityId}
          onCountryChange={setSelectedCountryId}
          onStateChange={setSelectedStateId}
          onCityChange={setSelectedCityId}
          filteredCount={filteredLocations.length}
          totalCount={
            activeTab === 'countries' ? countries.length :
            activeTab === 'states' ? states.length :
            activeTab === 'cities' ? cities.length :
            areas.length
          }
        />

        {/* Create Form */}
        <LocationCreateForm
          activeTab={activeTab}
          show={showInlineForm}
          onClose={() => {
            setShowInlineForm(false);
            setError(null);
            setSuccess(null);
          }}
          onSubmit={handleCreateSubmit}
          initialData={{
            country_id: selectedCountryId || undefined,
            state_id: selectedStateId || undefined,
            city_id: selectedCityId || undefined,
          }}
        />

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <div className="flex gap-3">
                {!showInlineForm && (
                  <button
                    onClick={() => {
                      setShowInlineForm(true);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
                  >
                    <FaPlus size={14} />
                    Quick Add
                  </button>
                )}
                <Link
                  href={`/dashboard/locations/${activeTab}/create`}
                  className="px-4 py-2 border-2 border-brand-600 text-brand-600 hover:bg-brand-50 font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  Full Form
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
              </div>
            ) : (
              <LocationsTable
                activeTab={activeTab}
                locations={filteredLocations}
                jobCounts={jobCounts}
                loadingCounts={loadingCounts}
                userRole={user.role}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
