'use client';

import Link from 'next/link';

interface JobCardProps {
  id: number;
  title: string;
  spa?: string;
  spaName?: string;
  spaAddress?: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceMin?: number;
  experienceMax?: number;
  jobOpeningCount?: number;
  jobType?: string;
  jobCategory?: string;
  slug: string;
  isFeatured?: boolean;
  viewCount?: number;
  created_at?: string;
  description?: string;
}

export default function JobCard({
  title,
  spaName,
  spaAddress,
  location,
  salaryMin,
  salaryMax,
  salaryCurrency = 'INR',
  experienceMin,
  experienceMax,
  jobOpeningCount,
  jobType,
  jobCategory,
  slug,
  isFeatured,
  viewCount,
  created_at,
  description,
}: JobCardProps) {
  const formatSalary = () => {
    if (!salaryMin && !salaryMax) return null;
    const formatAmount = (amount: number) => {
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
      }
      return `₹${(amount / 1000).toFixed(0)}k`;
    };

    if (salaryMin && salaryMax) {
      return `${formatAmount(salaryMin)} - ${formatAmount(salaryMax)} PA`;
    }
    if (salaryMin) return `${formatAmount(salaryMin)}+ PA`;
    if (salaryMax) return `Up to ${formatAmount(salaryMax)} PA`;
    return null;
  };

  const formatExperience = () => {
    if (!experienceMin && !experienceMax) return null;
    if (experienceMin && experienceMax) {
      return `${experienceMin} - ${experienceMax} yrs`;
    }
    if (experienceMin) return `${experienceMin}+ yrs`;
    if (experienceMax) return `0 - ${experienceMax} yrs`;
    return null;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return '1 day ago';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) {
      const weeks = Math.floor(daysAgo / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    }
    const months = Math.floor(daysAgo / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  };

  // Format location display
  const displayLocation = location || 'Location not specified';

  return (
    <Link href={`/jobs/${slug}`} className="block">
      <div className="bg-white border border-gray-300 rounded-lg p-5 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden">
        {/* Featured Badge - Top Right */}
        {isFeatured && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-md z-10">
            ⭐ Featured
          </div>
        )}

        <div className="flex gap-4">
          {/* SPA Logo/Avatar - Left Side */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-shadow">
              {spaName?.charAt(0).toUpperCase() || 'S'}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header Section with Apply Button */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                {/* Job Title */}
                <h3 className="text-lg font-semibold text-blue-600 group-hover:text-blue-700 transition-colors mb-1 line-clamp-2 leading-tight">
                  {title}
                </h3>
                
                {/* SPA Name */}
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {spaName || 'SPA'}
                </p>

                {/* Key Info Row - Salary, Experience, Location */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                  {formatSalary() && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-gray-900">{formatSalary()}</span>
                    </div>
                  )}
                  {formatExperience() && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{formatExperience()}</span>
                    </div>
                  )}
                  {displayLocation && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate max-w-[250px]" title={displayLocation}>{displayLocation}</span>
                    </div>
                  )}
                  {jobOpeningCount !== undefined && jobOpeningCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-gray-900 font-medium">{jobOpeningCount} {jobOpeningCount === 1 ? 'opening' : 'openings'}</span>
                    </div>
                  )}
                </div>

                {/* Spa Address - Shown separately for better visibility */}
                {spaAddress && (
                  <div className="flex items-start gap-1.5 text-sm text-gray-600 mb-3">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700 line-clamp-2" title={spaAddress}>{spaAddress}</span>
                  </div>
                )}
              </div>

              {/* Apply Button - Right Side */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/jobs/${slug}`;
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-md transition-all shadow-sm hover:shadow-md whitespace-nowrap text-sm"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Description Preview */}
            {description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}

            {/* Footer Section - Tags and Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200">
              {/* Job Type & Category Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {jobType && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {jobType}
                  </span>
                )}
                {jobCategory && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    {jobCategory}
                  </span>
                )}
              </div>

              {/* Metadata - Posted Date & Views */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {formatDate(created_at) && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(created_at)}
                  </span>
                )}
                {viewCount !== undefined && viewCount > 0 && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {viewCount} views
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      </div>
    </Link>
  );
}
