'use client';

import { Application } from '@/lib/application';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import Link from 'next/link';
import { FaBriefcase, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaFileAlt, FaEye } from 'react-icons/fa';

interface ApplicationCardProps {
  application: Application;
  onViewDetails?: (application: Application) => void;
  onStatusChange?: (id: number, status: string) => void;
}

export default function ApplicationCard({ application, onViewDetails, onStatusChange }: ApplicationCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {application.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{application.name}</h3>
            <p className="text-sm text-gray-500 truncate">{application.email}</p>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>
      </div>

      {/* Job Info */}
      <div className="mb-4 p-3 bg-brand-50 rounded-lg border border-brand-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-brand-600">
            <FaBriefcase size={14} />
          </div>
          <label className="text-xs font-medium text-gray-500">Applied for</label>
        </div>
        <Link
          href={`/jobs/${application.job?.slug || application.job_id}`}
          className="text-brand-600 hover:text-brand-700 font-semibold text-sm flex items-center gap-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          {application.job?.title || `Job #${application.job_id}`}
        </Link>
        {application.job?.salary_min || application.job?.salary_max ? (
          <p className="text-xs text-gray-600 mt-1">
            {application.job.salary_min && application.job.salary_max
              ? `${application.job.salary_currency || 'INR'} ${application.job.salary_min.toLocaleString()} - ${application.job.salary_max.toLocaleString()}`
              : application.job.salary_min
              ? `${application.job.salary_currency || 'INR'} ${application.job.salary_min.toLocaleString()}+`
              : `Up to ${application.job.salary_currency || 'INR'} ${application.job.salary_max?.toLocaleString()}`}
          </p>
        ) : null}
      </div>

      {/* Contact & Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
        {application.phone && (
          <div className="flex items-center gap-2">
            <div className="text-gray-400">
              <FaPhone size={12} />
            </div>
            <span className="truncate text-xs">{application.phone}</span>
          </div>
        )}
        {application.location && (
          <div className="flex items-center gap-2">
            <div className="text-gray-400">
              <FaMapMarkerAlt size={12} />
            </div>
            <span className="truncate text-xs">{application.location}</span>
          </div>
        )}
        {application.experience && (
          <div className="flex items-center gap-2">
            <div className="text-gray-400">
              <FaBriefcase size={12} />
            </div>
            <span className="truncate text-xs">{application.experience}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="text-gray-400">
            <FaCalendarAlt size={12} />
          </div>
          <span className="text-xs">{formatDate(application.created_at)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          {application.cv_file_path && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              <div className="mr-1.5">
                <FaFileAlt size={12} />
              </div>
              CV Available
            </span>
          )}
        </div>
        <button
          onClick={() => onViewDetails && onViewDetails(application)}
          className="px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaEye size={14} />
          View Details
        </button>
      </div>
    </div>
  );
}
