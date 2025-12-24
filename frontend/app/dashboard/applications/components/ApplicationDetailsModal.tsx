'use client';

import { useEffect, useState } from 'react';
import { Application } from '@/lib/application';
import { jobAPI } from '@/lib/job';
import Link from 'next/link';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import { FaUser, FaBriefcase, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase as FaExp, FaCalendarAlt, FaFileAlt, FaDownload, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';

interface ApplicationDetailsModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (id: number, status: string) => void;
}

export default function ApplicationDetailsModal({
  application,
  isOpen,
  onClose,
  onStatusUpdate,
}: ApplicationDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loadingJob, setLoadingJob] = useState(false);

  useEffect(() => {
    if (application) {
      setSelectedStatus(application.status);
      // Fetch full job details if job_id is available
      if (application.job_id && (!application.job || !application.job.title)) {
        fetchJobDetails(application.job_id);
      } else if (application.job) {
        setJobDetails(application.job);
      }
    }
  }, [application]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchJobDetails = async (jobId: number) => {
    setLoadingJob(true);
    try {
      const job = await jobAPI.getJobById(jobId);
      setJobDetails(job);
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    } finally {
      setLoadingJob(false);
    }
  };

  if (!isOpen || !application) return null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL ;
  const cvUrl = application.cv_file_path ? `${API_URL}/${application.cv_file_path}` : null;
  const isImageFile = application.cv_file_path
    ? /\.(jpg|jpeg|png|gif|webp)$/i.test(application.cv_file_path)
    : false;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Not specified';
    const curr = currency || 'INR';
    if (min && max) return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${curr} ${min.toLocaleString()}+`;
    if (max) return `Up to ${curr} ${max.toLocaleString()}`;
    return 'Not specified';
  };

  const handleStatusUpdate = () => {
    if (selectedStatus !== application.status && onStatusUpdate) {
      onStatusUpdate(application.id, selectedStatus);
    }
  };

  const handleCVDownload = () => {
    if (cvUrl) {
      window.open(cvUrl, '_blank');
    }
  };

  const job = jobDetails || application.job;
  const jobSlug = job?.slug || application.job?.slug;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Application Details</h2>
              <p className="text-brand-100 text-sm mt-1">View application information and resume</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-brand-800 rounded-lg"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="p-6 space-y-6">
              {/* Applicant Information */}
              <div className="bg-brand-50 rounded-lg p-5 border border-brand-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="text-brand-600">
                    <FaUser size={18} />
                  </div>
                  Applicant Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                    <p className="text-gray-900 font-medium">{application.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <a
                      href={`mailto:${application.email}`}
                      className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                    >
                      <FaEnvelope size={14} />
                      {application.email}
                    </a>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <a
                      href={`tel:${application.phone}`}
                      className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                    >
                      <FaPhone size={14} />
                      {application.phone}
                    </a>
                  </div>
                  {application.location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                      <p className="text-gray-900 flex items-center gap-1">
                        <span className="text-gray-400">
                          <FaMapMarkerAlt size={14} />
                        </span>
                        {application.location}
                      </p>
                    </div>
                  )}
                  {application.experience && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Experience</label>
                      <p className="text-gray-900 flex items-center gap-1">
                        <span className="text-gray-400">
                          <FaExp size={14} />
                        </span>
                        {application.experience}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Applied On</label>
                    <p className="text-gray-900 flex items-center gap-1">
                      <span className="text-gray-400">
                        <FaCalendarAlt size={14} />
                      </span>
                      {formatDate(application.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div className="bg-brand-50 rounded-lg p-5 border border-brand-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="text-brand-600">
                    <FaBriefcase size={18} />
                  </div>
                  Job Information
                </h3>
                {loadingJob ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading job details...</p>
                  </div>
                ) : job ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Job Title</label>
                      <Link
                        href={`/jobs/${jobSlug || application.job_id}`}
                        className="text-brand-600 hover:text-brand-700 font-semibold text-lg flex items-center gap-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {job.title || `Job #${application.job_id}`}
                        <FaExternalLinkAlt size={14} />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(job.salary_min || job.salary_max) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Salary Range</label>
                          <p className="text-gray-900 font-medium">
                            {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                          </p>
                        </div>
                      )}
                      {job.job_type_id && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Job Type</label>
                          <p className="text-gray-900">Available in job details</p>
                        </div>
                      )}
                      {job.job_category_id && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                          <p className="text-gray-900">Available in job details</p>
                        </div>
                      )}
                      {(job.city_id || job.state_id || job.country_id) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                          <p className="text-gray-900">Available in job details</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Link
                        href={`/jobs/${jobSlug || application.job_id}`}
                        className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaBriefcase size={14} />
                        View Full Job Details
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Job ID</label>
                      <Link
                        href={`/jobs/${application.job_id}`}
                        className="text-brand-600 hover:text-brand-700 font-semibold text-lg"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Job #{application.job_id}
                      </Link>
                    </div>
                    <p className="text-sm text-gray-500">Job details not available. Click to view job page.</p>
                    <Link
                      href={`/jobs/${application.job_id}`}
                      className="inline-block px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors text-sm flex items-center gap-2 w-fit"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaBriefcase size={14} />
                      View Job
                    </Link>
                  </div>
                )}
              </div>

              {/* Resume/CV Section */}
              {cvUrl && (
                <div className="bg-brand-50 rounded-lg p-5 border border-brand-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="text-brand-600">
                      <FaFileAlt size={18} />
                    </div>
                    Resume / CV
                  </h3>
                  
                  {/* Image Preview */}
                  {isImageFile && (
                    <div className="mb-4">
                      <img
                        src={cvUrl}
                        alt="Resume/CV"
                        className="max-w-full h-auto rounded-lg border border-gray-300 shadow-sm"
                        style={{ maxHeight: '600px' }}
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleCVDownload}
                      className="inline-flex items-center justify-center px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-lg transition-colors gap-2"
                    >
                      <FaDownload size={16} />
                      Download CV
                    </button>
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 bg-white border-2 border-brand-600 hover:bg-brand-50 text-brand-600 font-medium rounded-lg transition-colors gap-2"
                    >
                      <FaExternalLinkAlt size={16} />
                      View in New Tab
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700">Update Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 bg-white text-sm"
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={selectedStatus === application.status}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Update
              </button>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
