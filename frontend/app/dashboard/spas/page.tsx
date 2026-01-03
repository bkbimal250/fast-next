'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { spaAPI, Spa } from '@/lib/spa';
import { locationAPI } from '@/lib/location';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { showToast, showErrorToast } from '@/lib/toast';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Pagination from '@/components/Pagination';
import SearchableSelect from './components/SearchableSelect';

function ManageSpasContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [spas, setSpas] = useState<Spa[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize state from URL params or defaults
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>(
    (searchParams.get('status') as 'all' | 'active' | 'inactive') || 'all'
  );
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>(
    (searchParams.get('verified') as 'all' | 'verified' | 'unverified') || 'all'
  );
  const [filterCityId, setFilterCityId] = useState<number | null>(
    searchParams.get('city') ? parseInt(searchParams.get('city') || '0', 10) || null : null
  );
  const [filterAreaId, setFilterAreaId] = useState<number | null>(
    searchParams.get('area') ? parseInt(searchParams.get('area') || '0', 10) || null : null
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );
  const itemsPerPage = 20;
  
  // Location data for filters
  const [cities, setCities] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    spaId: number | null;
    spaName: string;
  }>({
    isOpen: false,
    spaId: null,
    spaName: '',
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'manager') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    loadSpas();
    loadLocations();
  }, []);
  
  // Load cities and areas for filters
  const loadLocations = async () => {
    setLoadingLocations(true);
    try {
      const [citiesData, areasData] = await Promise.all([
        locationAPI.getCities(undefined, undefined, 0, 1000),
        locationAPI.getAreas(undefined, 0, 1000),
      ]);
      setCities(citiesData);
      setAreas(areasData);
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setLoadingLocations(false);
    }
  };
  
  // Load areas when city filter changes
  useEffect(() => {
    if (filterCityId) {
      locationAPI.getAreas(filterCityId, 0, 1000).then(setAreas).catch(console.error);
    } else {
      // If no city selected, show all areas
      locationAPI.getAreas(undefined, 0, 1000).then(setAreas).catch(console.error);
    }
    // Reset area filter when city changes
    if (filterAreaId) {
      setFilterAreaId(null);
    }
  }, [filterCityId]);

  // Track if we're syncing from URL to prevent loops
  const isSyncingFromUrlRef = useRef(false);
  
  // Sync state from URL params when they change (e.g., browser back/forward)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlStatus = (searchParams.get('status') as 'all' | 'active' | 'inactive') || 'all';
    const urlVerified = (searchParams.get('verified') as 'all' | 'verified' | 'unverified') || 'all';
    const urlCity = searchParams.get('city') ? parseInt(searchParams.get('city') || '0', 10) || null : null;
    const urlArea = searchParams.get('area') ? parseInt(searchParams.get('area') || '0', 10) || null : null;
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    
    // Mark that we're syncing from URL
    isSyncingFromUrlRef.current = true;
    
    // Only update if different (to avoid unnecessary re-renders)
    setSearchTerm(urlSearch);
    setFilterStatus(urlStatus);
    setFilterVerified(urlVerified);
    setFilterCityId(urlCity);
    setFilterAreaId(urlArea);
    setCurrentPage(urlPage);
    
    // Reset the flag after a brief delay
    requestAnimationFrame(() => {
      isSyncingFromUrlRef.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL params when state changes (but skip when syncing from URL)
  const [isInitialSync, setIsInitialSync] = useState(true);
  
  useEffect(() => {
    // Skip the first sync since we already initialized from URL
    if (isInitialSync) {
      setIsInitialSync(false);
      return;
    }
    
    // Skip if we're currently syncing from URL
    if (isSyncingFromUrlRef.current) {
      return;
    }
    
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (filterStatus !== 'all') params.set('status', filterStatus);
    if (filterVerified !== 'all') params.set('verified', filterVerified);
    if (filterCityId) params.set('city', filterCityId.toString());
    if (filterAreaId) params.set('area', filterAreaId.toString());
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const queryString = params.toString();
    const newUrl = queryString ? `/dashboard/spas?${queryString}` : '/dashboard/spas';
    
    // Get current URL to compare
    const currentUrl = window.location.pathname + (window.location.search || '');
    if (newUrl !== currentUrl) {
      // Use replace to avoid adding history entries, but preserve back button functionality
      router.replace(newUrl, { scroll: false });
    }
  }, [searchTerm, filterStatus, filterVerified, filterCityId, filterAreaId, currentPage, router, isInitialSync]);

  const loadSpas = async () => {
    setLoading(true);
    try {
      // Fetch all SPAs by using a very high limit (or we could fetch in batches)
      // Since backend has limit=100 default, we'll fetch with a high limit to get all
      const data = await spaAPI.getSpas({ limit: 1000 });
      setSpas(data);
      // Don't reset page - it's already initialized from URL params
    } catch (error) {
      console.error('Failed to load SPAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (spaId: number, spaName: string) => {
    setDeleteModal({
      isOpen: true,
      spaId,
      spaName,
    });
  };

  const handleDeleteConfirm = async (permanent: boolean) => {
    if (!deleteModal.spaId) return;

    setDeleting(true);
    try {
      await spaAPI.deleteSpa(deleteModal.spaId, permanent);
      setDeleteModal({ isOpen: false, spaId: null, spaName: '' });
      loadSpas();
      showToast.success(permanent ? 'SPA permanently deleted' : 'SPA deleted successfully');
    } catch (error: any) {
      showErrorToast(error, 'Failed to delete SPA');
    } finally {
      setDeleting(false);
    }
  };

  // Filter and search SPAs, then sort by created_at (newest first)
  const filteredSpas = useMemo(() => {
    const filtered = spas.filter((spa) => {
      const matchesSearch = 
        spa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spa.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spa.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spa.address?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'active' && spa.is_active) ||
        (filterStatus === 'inactive' && !spa.is_active);

      const matchesVerified =
        filterVerified === 'all' ||
        (filterVerified === 'verified' && spa.is_verified) ||
        (filterVerified === 'unverified' && !spa.is_verified);

      const matchesCity = 
        !filterCityId || spa.city_id === filterCityId;

      const matchesArea = 
        !filterAreaId || spa.area_id === filterAreaId;

      return matchesSearch && matchesStatus && matchesVerified && matchesCity && matchesArea;
    });
    
    // Sort by created_at descending (newest first)
    return filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA; // Descending order
    });
  }, [spas, searchTerm, filterStatus, filterVerified, filterCityId, filterAreaId]);

  // Calculate statistics based on all SPAs (not filtered)
  const stats = useMemo(() => ({
    total: spas.length,
    active: spas.filter((s) => s.is_active).length,
    inactive: spas.filter((s) => !s.is_active).length,
    verified: spas.filter((s) => s.is_verified).length,
  }), [spas]);

  // Paginate filtered SPAs
  const paginatedSpas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSpas.slice(startIndex, endIndex);
  }, [filteredSpas, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change (user interaction, not URL restoration)
  const prevFiltersRef = useRef({ searchTerm, filterStatus, filterVerified, filterCityId, filterAreaId });
  
  useEffect(() => {
    if (isInitialSync) {
      prevFiltersRef.current = { searchTerm, filterStatus, filterVerified, filterCityId, filterAreaId };
      return;
    }
    
    const filtersChanged = 
      prevFiltersRef.current.searchTerm !== searchTerm ||
      prevFiltersRef.current.filterStatus !== filterStatus ||
      prevFiltersRef.current.filterVerified !== filterVerified ||
      prevFiltersRef.current.filterCityId !== filterCityId ||
      prevFiltersRef.current.filterAreaId !== filterAreaId;
    
    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
    }
    
    prevFiltersRef.current = { searchTerm, filterStatus, filterVerified, filterCityId, filterAreaId };
  }, [searchTerm, filterStatus, filterVerified, filterCityId, filterAreaId, currentPage, isInitialSync]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';

  if (loading && spas.length === 0) {
    return (
      <div className="min-h-screen bg-surface-light">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-5">
            <div className="h-8 bg-gray-200 rounded-lg w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage SPAs</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">View and manage all spa listings in your system</p>
            </div>
            <Link
              href="/dashboard/spas/create"
              className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New SPA
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total SPAs</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-brand-100 rounded-lg p-2.5">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Active</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-2.5">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{stats.inactive}</p>
                </div>
                <div className="bg-red-100 rounded-lg p-2.5">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-xl sm:text-2xl font-bold text-brand-600 mt-1">{stats.verified}</p>
                </div>
                <div className="bg-brand-100 rounded-lg p-2.5">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, email, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Verified Filter */}
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value as 'all' | 'verified' | 'unverified')}
              className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>

            {/* City Filter */}
            <SearchableSelect
              options={cities.map((city) => ({ id: city.id, name: city.name }))}
              value={filterCityId}
              onChange={setFilterCityId}
              placeholder="All Cities"
              disabled={loadingLocations}
            />

            {/* Area Filter */}
            <SearchableSelect
              options={areas
                .filter((area) => !filterCityId || area.city_id === filterCityId)
                .map((area) => ({ id: area.id, name: area.name }))}
              value={filterAreaId}
              onChange={setFilterAreaId}
              placeholder="All Areas"
              disabled={loadingLocations || !filterCityId}
            />
          </div>

          {/* Results Count */}
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredSpas.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{stats.total}</span> SPAs
            {filteredSpas.length !== stats.total && (
              <span className="ml-2">
                ({paginatedSpas.length} on this page)
              </span>
            )}
          </div>
        </div>

        {/* SPAs List */}
        {filteredSpas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center border border-gray-200">
            <div className="mx-auto w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-brand-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No SPAs Found</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              {searchTerm || filterStatus !== 'all' || filterVerified !== 'all' || filterCityId || filterAreaId
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first SPA listing.'}
            </p>
            {(!searchTerm && filterStatus === 'all' && filterVerified === 'all') && (
              <Link href="/dashboard/spas/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors shadow-md">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First SPA
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-brand-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      SPA Details
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSpas.map((spa) => (
                    <tr key={spa.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-4">
                          {/* SPA Image/Logo */}
                          {spa.spa_images && spa.spa_images.length > 0 ? (
                            <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                              <img
                                src={`${API_URL}/${spa.spa_images[0]}`}
                                alt={spa.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                              {spa.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/dashboard/spas/${spa.id}`}
                                className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {spa.name}
                              </Link>
                              {spa.is_verified && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-800">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">ID: {spa.id}</p>
                            {spa.slug && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{spa.slug}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="text-xs sm:text-sm text-gray-900 space-y-1">
                          {spa.email && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="truncate max-w-xs">{spa.email}</span>
                            </div>
                          )}
                          {spa.phone && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span>{spa.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        {spa.address ? (
                          <div className="flex items-start gap-2 max-w-xs">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs sm:text-sm text-gray-600 line-clamp-2" title={spa.address}>
                              {spa.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-400">No address</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                              spa.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {spa.is_active ? (
                              <>
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></span>
                                Active
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1.5"></span>
                                Inactive
                              </>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex justify-end items-center gap-2">
                          <Link
                            href={`/dashboard/spas/${spa.id}`}
                            className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            href={`/dashboard/spas/${spa.id}/edit`}
                            className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteClick(spa.id, spa.name)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {filteredSpas.length > itemsPerPage && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredSpas.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, spaId: null, spaName: '' })}
          onConfirm={handleDeleteConfirm}
          title="Delete SPA"
          message="Are you sure you want to delete this SPA?"
          itemName={deleteModal.spaName}
          isAdmin={user?.role === 'admin'}
          loading={deleting}
        />
      </div>
    </div>
  );
}

export default function ManageSpasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    }>
      <ManageSpasContent />
    </Suspense>
  );
}
