'use client';

import Image from 'next/image';
import { FaStar, FaRegStar, FaStarHalfAlt, FaCheckCircle } from 'react-icons/fa';
import { JobWithRelations, getLogoUrl, getInitials } from './utils';

interface JobHeaderProps {
  job: JobWithRelations;
}

export default function JobHeader({ job }: JobHeaderProps) {
  const logoUrl = getLogoUrl(job.spa?.logo_image);
  const spaRating = (job.spa as any)?.rating as number | undefined;
  const spaReviews = (job.spa as any)?.reviews as number | undefined;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-4">
        <div className="flex items-start gap-4">
          {/* SPA Logo */}
          <div className="flex-shrink-0">
            {logoUrl ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-white flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt={job.spa?.name || 'SPA Logo'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-brand-600 font-bold text-xl shadow-lg border-2 border-white">
                {getInitials(job.spa?.name)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">{job.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white/90">{job.spa?.name || 'SPA'}</h2>
                {(job.spa as any)?.is_verified && (
                  <span 
                    className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 border border-white/30"
                    title="Verified Organization - Business details checked"
                  >
                    <FaCheckCircle size={12} />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              {spaRating !== undefined && spaReviews !== undefined && (
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                  <span className="text-sm font-semibold text-white">{spaRating.toFixed(1)}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => {
                      const rating = Math.round(spaRating);
                      const isFull = i < rating;
                      const isHalf = i === rating - 0.5;
                      return isFull ? (
                        <div key={i} className="text-yellow-300">
                          <FaStar size={14} />
                        </div>
                      ) : isHalf ? (
                        <div key={i} className="text-yellow-300">
                          <FaStarHalfAlt size={14} />
                        </div>
                      ) : (
                        <div key={i} className="text-white/40">
                          <FaRegStar size={14} />
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-xs text-white/80">({spaReviews})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

