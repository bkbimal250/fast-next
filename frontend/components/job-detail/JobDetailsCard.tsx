'use client';

import Image from 'next/image';
import { FaBriefcase, FaRupeeSign, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaEye } from 'react-icons/fa';
import { JobWithRelations, formatSalary, formatExperience, formatDate, getInitials, getLogoUrl } from './utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

interface JobDetailsCardProps {
  job: JobWithRelations;
  applicationCount?: number;
  onTrackApplyClick?: () => void;
}

export default function JobDetailsCard({ job, applicationCount = 0, onTrackApplyClick }: JobDetailsCardProps) {
  const locationParts = [
    job.area?.name,
    job.city?.name,
    job.state?.name,
    job.postalCode,
  ].filter(Boolean);

  const formatApplicationCount = () => {
    if (applicationCount === 0) return null;
    if (applicationCount >= 100) return '100+';
    return applicationCount.toString();
  };

  return (
    <div className="p-6">
      {/* Key Job Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-200">
        {formatExperience(job) && (
          <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg border border-brand-100">
            <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 text-brand-600">
              <FaBriefcase size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Experience</p>
              <p className="text-sm font-semibold text-gray-900">{formatExperience(job)}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 p-3 bg-gold-50 rounded-lg border border-gold-200">
          <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0 text-gold-600">
            <FaRupeeSign size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Salary</p>
            <p className="text-sm font-semibold text-gray-900">{formatSalary(job)}</p>
          </div>
        </div>
        {locationParts.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-600">
              <FaMapMarkerAlt size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Location</p>
              <p className="text-sm font-semibold text-gray-900">{locationParts.join(', ')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Posted By & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-gray-200">
        {job.spa && (
          <div className="flex items-center gap-3">
            {getLogoUrl(job.spa?.logo_image) ? (
              <Image
                src={getLogoUrl(job.spa?.logo_image)!}
                alt={job.spa?.name || 'SPA Logo'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                unoptimized
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-sm font-semibold border border-gray-200">
                {getInitials(job.spa?.name || 'SPA')}
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Posted by</p>
              <p className="text-sm font-semibold text-gray-900">{job.spa?.name}</p>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1.5 text-gray-400">
            <FaCalendarAlt size={14} />
            <span className="text-gray-600">Posted {formatDate(job.created_at)}</span>
          </span>
          {job.job_opening_count && (
            <span className="flex items-center gap-1.5 text-gray-400">
              <FaUsers size={14} />
              <span className="text-gray-600">{job.job_opening_count} {job.job_opening_count === 1 ? 'opening' : 'openings'}</span>
            </span>
          )}
          {formatApplicationCount() && (
            <span className="flex items-center gap-1.5 text-gray-400">
              <FaUsers size={14} />
              <span className="text-gray-600">{formatApplicationCount()} applicants</span>
            </span>
          )}
          <span className="flex items-center gap-1.5 text-gray-400">
            <FaEye size={14} />
            <span className="text-gray-600">{job.view_count || 0} views</span>
          </span>
          {job.expires_at && formatDate(job.expires_at) && (
            <span className="flex items-center gap-1.5 text-gray-400">
              <FaCalendarAlt size={14} />
              <span className="text-gray-600">Expires {formatDate(job.expires_at)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

