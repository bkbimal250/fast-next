'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { applicationAPI, Application } from '@/lib/application';
import { authAPI } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { FaFileAlt, FaSearch, FaFilter, FaCheckCircle, FaClock, FaTimesCircle, FaEye } from 'react-icons/fa';
import ApplicationsList from './components/ApplicationsList';
import ApplicationDetailsModal from './components/ApplicationDetailsModal';
import { showToast, showErrorToast } from '@/lib/toast';

export default function ManageApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      // For regular users, use the user's own applications endpoint
      if (user.role === 'user') {
        const fetchedApplications = await authAPI.getMyApplications();
        setApplications(fetchedApplications);
      } 
      // For recruiters, use recruiter-specific endpoint
      else if (user.role === 'recruiter') {
        const fetchedApplications = await applicationAPI.getMyApplications();
        setApplications(fetchedApplications);
      } 
      // For admin/manager, get all applications
      else {
        const fetchedApplications = await applicationAPI.getAllApplications({ skip: 0, limit: 1000 });
        setApplications(fetchedApplications);
      }
    } catch (err: any) {
      console.error('Failed to fetch applications:', err);
      const errorMessage =
        err.response?.data?.detail ||
        (err.response?.status === 404 ? 'No applications found' : 'Failed to fetch applications');
      setError(errorMessage);
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
      // Refresh the list
      await fetchApplications();
      showToast.success('Application status updated successfully');
    } catch (err: any) {
      console.error('Failed to update application status:', err);
      showErrorToast(err, 'Failed to update application status');
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isRegularUser = user.role === 'user';
  const canManageApplications = user.role === 'admin' || user.role === 'manager' || user.role === 'recruiter';

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status.toLowerCase() === 'pending').length,
    reviewed: applications.filter((a) => a.status.toLowerCase() === 'reviewed').length,
    accepted: applications.filter((a) => a.status.toLowerCase() === 'accepted').length,
    rejected: applications.filter((a) => a.status.toLowerCase() === 'rejected').length,
  };

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
                  <FaFileAlt size={28} />
                </div>
                {isRegularUser ? 'My Applications' : 'Manage Applications'}
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {isRegularUser ? 'View your job application history' : 'View and manage all job applications'}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Statistics Cards - Only show for admin/manager/recruiter */}
          {canManageApplications && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-5">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <div className="bg-brand-100 rounded-lg p-2">
                  <div className="text-brand-600">
                    <FaFileAlt size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <div className="bg-yellow-100 rounded-lg p-2">
                  <div className="text-yellow-600">
                    <FaClock size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Reviewed</p>
                <div className="bg-blue-100 rounded-lg p-2">
                  <div className="text-blue-600">
                    <FaEye size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.reviewed}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Accepted</p>
                <div className="bg-green-100 rounded-lg p-2">
                  <div className="text-green-600">
                    <FaCheckCircle size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.accepted}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
                <div className="bg-red-100 rounded-lg p-2">
                  <div className="text-red-600">
                    <FaTimesCircle size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>
          )}
          
          {/* Statistics Cards - Show simplified version for regular users */}
          {isRegularUser && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <div className="bg-brand-100 rounded-lg p-2">
                  <div className="text-brand-600">
                    <FaFileAlt size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <div className="bg-yellow-100 rounded-lg p-2">
                  <div className="text-yellow-600">
                    <FaClock size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Accepted</p>
                <div className="bg-green-100 rounded-lg p-2">
                  <div className="text-green-600">
                    <FaCheckCircle size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.accepted}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
                <div className="bg-red-100 rounded-lg p-2">
                  <div className="text-red-600">
                    <FaTimesCircle size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Applications List */}
        {!error && (
          <ApplicationsList
            applications={applications}
            onViewDetails={handleViewDetails}
            onStatusChange={canManageApplications ? handleStatusUpdate : undefined}
          />
        )}

        {/* Application Details Modal */}
        <ApplicationDetailsModal
          application={selectedApplication}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={canManageApplications ? handleStatusUpdate : undefined}
        />
      </div>
    </div>
  );
}
