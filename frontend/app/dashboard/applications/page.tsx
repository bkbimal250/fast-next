'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { applicationAPI, Application } from '@/lib/application';
import { authAPI } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { FaFileAlt, FaSearch, FaFilter, FaCheckCircle, FaClock, FaTimesCircle, FaEye } from 'react-icons/fa';
import ApplicationsList from './components/ApplicationsList';
import ApplicationDetailsModal from './components/ApplicationDetailsModal';
import { showToast, showErrorToast } from '@/lib/toast';
import Pagination from '@/components/Pagination';

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
  const [filters, setFilters] = useState({ status: '', search: '' });

  // Track if we're syncing from URL to prevent loops
  const isSyncingFromUrlRef = useRef(false);

  // Sync state from URL params when they change (e.g., browser back/forward)
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    
    // Mark that we're syncing from URL
    isSyncingFromUrlRef.current = true;
    
    // Only update if different
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
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const queryString = params.toString();
    const newUrl = queryString ? `/dashboard/applications?${queryString}` : '/dashboard/applications';
    
    // Get current URL to compare
    const currentUrl = window.location.pathname + (window.location.search || '');
    if (newUrl !== currentUrl) {
      // Use replace to avoid adding history entries, but preserve back button functionality
      router.replace(newUrl, { scroll: false });
    }
  }, [currentPage, router, isInitialSync]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchApplications();
  }, [user, router]);

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
