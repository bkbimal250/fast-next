'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaBuilding, FaStar, FaRegStar } from 'react-icons/fa';
import { JobWithRelations, getLogoUrl, getInitials } from './utils';

interface CompanyInfoProps {
  job: JobWithRelations;
}

export default function CompanyInfo({ job }: CompanyInfoProps) {
  if (!job.spa) return null;

  const logoUrl = getLogoUrl(job.spa.logo_image);
  const spaRating = (job.spa as any)?.rating as number | undefined;
  const spaReviews = (job.spa as any)?.reviews as number | undefined;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200 flex items-center gap-2">
        <div className="text-brand-600">
          <FaBuilding size={16} />
        </div>
        About the Company
      </h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
              <Image
                src={logoUrl}
                alt={job.spa.name || 'SPA Logo'}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0 border border-gray-200">
              {getInitials(job.spa.name)}
            </div>
          )}
          <div>
            <Link href={`/spas/${job.spa.slug}`} className="text-lg font-semibold text-brand-600 hover:underline block">
              {job.spa.name}
            </Link>
            {spaRating !== undefined && spaReviews !== undefined && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-sm font-medium text-gray-700">{spaRating.toFixed(1)}</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => {
                    const rating = Math.round(spaRating);
                    return i < rating ? (
                      <div key={i} className="text-yellow-400">
                        <FaStar size={14} />
                      </div>
                    ) : (
                      <div key={i} className="text-gray-300">
                        <FaRegStar size={14} />
                      </div>
                    );
                  })}
                </div>
                <span className="text-xs text-gray-600">({spaReviews} reviews)</span>
              </div>
            )}
          </div>
        </div>
        {job.spa.address && (
          <p className="text-sm text-gray-600 leading-relaxed">{job.spa.address}</p>
        )}
        <Link
          href={`/spas/${job.spa.slug}`}
          className="block text-center px-4 py-2.5 border-2 border-brand-600 text-brand-600 rounded-lg hover:bg-brand-50 text-sm font-semibold transition-colors"
        >
          View Company Profile
        </Link>
      </div>
    </div>
  );
}

