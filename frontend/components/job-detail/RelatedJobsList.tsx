'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaBriefcase, FaStar, FaRegStar } from 'react-icons/fa';
import { Job } from '@/lib/job';
import { getLogoUrl, getInitials } from './utils';

interface RelatedJobsListProps {
  jobs: Job[];
  currentJobId: number;
}

export default function RelatedJobsList({ jobs, currentJobId }: RelatedJobsListProps) {
  if (jobs.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <div className="text-brand-500">
          <FaBriefcase size={18} />
        </div>
        <h3 className="text-base font-semibold text-gray-900">Similar Jobs</h3>
      </div>
      <div className="space-y-3">
        {jobs.filter(job => job.id !== currentJobId).map((job) => {
          const logoUrl = getLogoUrl(job.spa?.logo_image);
          const spaRating = (job.spa as any)?.rating as number | undefined;
          const spaReviews = (job.spa as any)?.reviews as number | undefined;
          
          return (
            <Link key={job.id} href={`/jobs/${job.slug}`} className="block group">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-brand-400 hover:shadow-md transition-all bg-white">
                <div className="flex items-start gap-3">
                  {logoUrl ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                      <Image
                        src={logoUrl}
                        alt={job.spa?.name || 'SPA Logo'}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border border-gray-200">
                      {getInitials(job.spa?.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-brand-600 transition-colors text-sm leading-tight">
                      {job.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-1.5">
                      {job.spa?.name || 'SPA'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      {job.salary_min && (
                        <span className="font-medium text-green-600">
                          ₹{(job.salary_min / 1000).toFixed(0)}k+
                        </span>
                      )}
                      <span>•</span>
                      <span>
                        {[job.area?.name, job.city?.name].filter(Boolean).join(', ') || 'Location'}
                      </span>
                    </div>
                    {spaRating !== undefined && spaReviews !== undefined && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs font-medium text-gray-700">
                          {spaRating.toFixed(1)}
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => {
                            const rating = Math.round(spaRating);
                            return i < rating ? (
                              <div key={i} className="text-yellow-400">
                                <FaStar size={12} />
                              </div>
                            ) : (
                              <div key={i} className="text-gray-300">
                                <FaRegStar size={12} />
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({spaReviews})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

