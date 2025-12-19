'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { applicationAPI, Application } from '@/lib/application';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import ApplicationsList from './components/ApplicationsList';
import ApplicationDetailsModal from './components/ApplicationDetailsModal';

export default function ManageApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'recruiter')) {
      router.push('/dashboard');
    } else {
      fetchApplications();
    }
  }, [user, router]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      // For recruiters, use recruiter-specific endpoint
      if (user?.role === 'recruiter') {
        const fetchedApplications = await applicationAPI.getMyApplications();
        setApplications(fetchedApplications);
      } else {
        // For admin/manager, try to get all applications
        try {
          const fetchedApplications = await applicationAPI.getAllApplications();
          setApplications(fetchedApplications);
        } catch (err: any) {
          // If endpoint doesn't exist, show helpful message
          if (err.response?.status === 404 || err.response?.status === 405) {
            setError('Applications endpoint is not available. Please contact the administrator.');
          } else {
            throw err;
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch applications:', err);
      const errorMessage =
        err.response?.data?.detail ||
        (err.response?.status === 404 ? 'No applications found' : 'Failed to fetch applications');
      setError(errorMessage);
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
      // Update the application in the list
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
      // Update selected application if it's the one being updated
      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication({ ...selectedApplication, status });
      }
      // Close modal after update
      handleCloseModal();
      // Optionally refresh the list
      fetchApplications();
    } catch (err: any) {
      console.error('Failed to update application status:', err);
      alert(err.response?.data?.detail || 'Failed to update application status');
    }
  };

  if (loading || !user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'recruiter')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Applications</h1>
              <p className="text-gray-600 mt-2">View and manage all job applications</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Applications List */}
        {!error && (
          <ApplicationsList
            applications={applications}
            onViewDetails={handleViewDetails}
            onStatusChange={handleStatusUpdate}
          />
        )}

        {/* Application Details Modal */}
        <ApplicationDetailsModal
          application={selectedApplication}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
}
