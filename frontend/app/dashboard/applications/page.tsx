'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { applicationAPI, Application } from '@/lib/application';
import { authAPI } from '@/lib/auth';
import { jobAPI, JobType, JobCategory } from '@/lib/job';
import { locationAPI } from '@/lib/location';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle, FaEye } from 'react-icons/fa';
import ApplicationsList from './components/ApplicationsList';
import ApplicationDetailsModal from './components/ApplicationDetailsModal';
import { showToast, showErrorToast } from '@/lib/toast';

function ManageApplicationsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );
  const itemsPerPage = 20;
  
  // Filter state
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
    stateId: searchParams.get('state') ? parseInt(searchParams.get('state') || '0', 10) || null : null,
    cityId: searchParams.get('city') ? parseInt(searchParams.get('city') || '0', 10) || null : null,
    areaId: searchParams.get('area') ? parseInt(searchParams.get('area') || '0', 10) || null : null,
    jobTypeId: searchParams.get('job_type') ? parseInt(searchParams.get('job_type') || '0', 10) || null : null,
    jobCategoryId: searchParams.get('job_category') ? parseInt(searchParams.get('job_category') || '0', 10) || null : null,
  });

  // Location and job data for filters
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Track if we're syncing from URL to prevent loops
  const isSyncingFromUrlRef = useRef(false);

  // Sync state from URL params when they change (e.g., browser back/forward)
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlStatus = searchParams.get('status') || '';
    const urlSearch = searchParams.get('search') || '';
    const urlState = searchParams.get('state') ? parseInt(searchParams.get('state') || '0', 10) || null : null;
    const urlCity = searchParams.get('city') ? parseInt(searchParams.get('city') || '0', 10) || null : null;
    const urlArea = searchParams.get('area') ? parseInt(searchParams.get('area') || '0', 10) || null : null;
    const urlJobType = searchParams.get('job_type') ? parseInt(searchParams.get('job_type') || '0', 10) || null : null;
    const urlJobCategory = searchParams.get('job_category') ? parseInt(searchParams.get('job_category') || '0', 10) || null : null;
    
    // Mark that we're syncing from URL
    isSyncingFromUrlRef.current = true;
    
    // Only update if different
    setCurrentPage(urlPage);
    setFilters({
      status: urlStatus,
      search: urlSearch,
      stateId: urlState,
      cityId: urlCity,
      areaId: urlArea,
      jobTypeId: urlJobType,
      jobCategoryId: urlJobCategory,
    });
    
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
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.stateId) params.set('state', filters.stateId.toString());
    if (filters.cityId) params.set('city', filters.cityId.toString());
    if (filters.areaId) params.set('area', filters.areaId.toString());
    if (filters.jobTypeId) params.set('job_type', filters.jobTypeId.toString());
    if (filters.jobCategoryId) params.set('job_category', filters.jobCategoryId.toString());
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const queryString = params.toString();
    const newUrl = queryString ? `/dashboard/applications?${queryString}` : '/dashboard/applications';
    
    // Get current URL to compare
    const currentUrl = window.location.pathname + (window.location.search || '');
    if (newUrl !== currentUrl) {
      // Use replace to avoid adding history entries, but preserve back button functionality
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, currentPage, router, isInitialSync]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchApplications();
    loadFilterData();
  }, [user, router]);

  // Load filter data (locations, job types, categories)
  const loadFilterData = async () => {
    setLoadingLocations(true);
    try {
      const [statesData, citiesData, areasData, jobTypesData, jobCategoriesData] = await Promise.all([
        locationAPI.getStates(undefined, 0, 1000),
        locationAPI.getCities(undefined, undefined, 0, 1000),
        locationAPI.getAreas(undefined, 0, 1000),
        jobAPI.getJobTypes(),
        jobAPI.getJobCategories(),
      ]);
      setStates(statesData);
      setCities(citiesData);
      setAreas(areasData);
      setJobTypes(jobTypesData);
      setJobCategories(jobCategoriesData);
    } catch (error) {
      console.error('Failed to load filter data:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Load cities when state filter changes
  useEffect(() => {
    if (filters.stateId) {
      locationAPI.getCities(filters.stateId, undefined, 0, 1000).then(setCities).catch(console.error);
    } else {
      locationAPI.getCities(undefined, undefined, 0, 1000).then(setCities).catch(console.error);
    }
    // Reset city and area filters when state changes
    if (filters.cityId || filters.areaId) {
      setFilters(prev => ({ ...prev, cityId: null, areaId: null }));
    }
  }, [filters.stateId]);

  // Load areas when city filter changes
  useEffect(() => {
    if (filters.cityId) {
      locationAPI.getAreas(filters.cityId, 0, 1000).then(setAreas).catch(console.error);
    } else {
      locationAPI.getAreas(undefined, 0, 1000).then(setAreas).catch(console.error);
    }
    // Reset area filter when city changes
    if (filters.areaId) {
      setFilters(prev => ({ ...prev, areaId: null }));
    }
  }, [filters.cityId]);

  const fetchApplications = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      let fetchedApplications: Application[] = [];
      
      if (user.role === 'user') {
        fetchedApplications = await authAPI.getMyApplications();
      } else if (user.role === 'recruiter') {
        fetchedApplications = await applicationAPI.getMyApplications({ limit: 1000 });
      } else {
        fetchedApplications = await applicationAPI.getAllApplications({ skip: 0, limit: 1000 });
      }
      
      // Sort by created_at descending (newest first) to ensure newest applications appear first
      fetchedApplications.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      });
      
      setApplications(fetchedApplications);
    } catch (err: any) {
      console.error('Failed to fetch applications:', err);
      setError(err.response?.data?.detail || 'Failed to fetch applications');
      showErrorToast(err, 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await applicationAPI.updateApplication(id, { status });
      showToast.success('Application status updated successfully');
      fetchApplications();
      if (selectedApplication?.id === id) {
        setSelectedApplication({ ...selectedApplication, status: status as any });
      }
    } catch (err: any) {
      console.error('Failed to update application status:', err);
      showErrorToast(err, 'Failed to update application status');
    }
  };

  const handleDeleteApplication = async (id: number) => {
    try {
      await applicationAPI.deleteApplication(id, true); // Permanent delete for admin
      showToast.success('Application deleted successfully');
      fetchApplications();
      if (selectedApplication?.id === id) {
        handleCloseModal();
      }
    } catch (err: any) {
      console.error('Failed to delete application:', err);
      showErrorToast(err, 'Failed to delete application');
    }
  };

  const canManageApplications = user && (user.role === 'admin' || user.role === 'manager' || user.role === 'recruiter');

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status.toLowerCase() === 'pending').length,
      reviewed: applications.filter((a) => a.status.toLowerCase() === 'reviewed').length,
      accepted: applications.filter((a) => a.status.toLowerCase() === 'accepted').length,
      rejected: applications.filter((a) => a.status.toLowerCase() === 'rejected').length,
    };
  }, [applications]);

  // Reset to page 1 when filters change (user interaction, not URL restoration)
  const prevFiltersRef = useRef(filters);
  
  useEffect(() => {
    if (isInitialSync) {
      prevFiltersRef.current = filters;
      return;
    }
    
    const filtersChanged = 
      prevFiltersRef.current.status !== filters.status ||
      prevFiltersRef.current.search !== filters.search ||
      prevFiltersRef.current.stateId !== filters.stateId ||
      prevFiltersRef.current.cityId !== filters.cityId ||
      prevFiltersRef.current.areaId !== filters.areaId ||
      prevFiltersRef.current.jobTypeId !== filters.jobTypeId ||
      prevFiltersRef.current.jobCategoryId !== filters.jobCategoryId;
    
    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
    }
    
    prevFiltersRef.current = filters;
  }, [filters, currentPage, isInitialSync]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Applications</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {user.role === 'user' 
                ? 'View and manage your job applications' 
                : 'Review and manage job applications'}
            </p>
          </div>
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-brand-100 rounded-lg p-2.5">
                <FaFileAlt className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 rounded-lg p-2.5">
                <FaClock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Reviewed</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{stats.reviewed}</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-2.5">
                <FaEye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{stats.accepted}</p>
              </div>
              <div className="bg-green-100 rounded-lg p-2.5">
                <FaCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="bg-red-100 rounded-lg p-2.5">
                <FaTimesCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <ApplicationsList
          applications={applications}
          onViewDetails={handleViewDetails}
          onStatusChange={canManageApplications ? handleStatusUpdate : undefined}
          onDelete={user?.role === 'admin' ? handleDeleteApplication : undefined}
          filters={filters}
          onFiltersChange={setFilters}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          states={states}
          cities={cities}
          areas={areas}
          jobTypes={jobTypes}
          jobCategories={jobCategories}
          loadingLocations={loadingLocations}
        />

        <ApplicationDetailsModal
          application={selectedApplication}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={canManageApplications ? handleStatusUpdate : undefined}
          onDelete={user?.role === 'admin' ? handleDeleteApplication : undefined}
        />
      </div>
    </div>
  );
}

export default function ManageApplicationsPage() {
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
      <ManageApplicationsContent />
    </Suspense>
  );
}
