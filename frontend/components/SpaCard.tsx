'use client';

import Link from 'next/link';
import { Spa } from '@/lib/spa';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { FaDirections, FaBriefcase, FaShareAlt, FaCheckCircle, FaStar, FaStarHalfAlt, FaRegStar, FaCalendarCheck, FaMapMarkerAlt } from 'react-icons/fa';
import { capitalizeTitle } from '@/lib/text-utils';

interface SpaCardProps {
  spa: Spa;
  distance?: number;
  showDistance?: boolean;
  jobCount?: number;
}

export default function SpaCard({ spa, distance, showDistance = true, jobCount: initialJobCount }: SpaCardProps) {
  const [jobCount, setJobCount] = useState<number | null>(initialJobCount ?? null);

  useEffect(() => {
    if (jobCount === null && spa.id) {
      // Fetch job count for this spa using apiClient (which handles HTTPS properly)
      apiClient.get('/api/jobs/', { params: { spa_id: spa.id } })
        .then(res => {
          setJobCount(Array.isArray(res.data) ? res.data.length : 0);
        })
        .catch(() => setJobCount(0));
    }
  }, [spa.id, jobCount]);

  const formatDistance = (dist: number): string => {
    if (dist < 1) {
      return `${dist.toFixed(1)} km`;
    }
    return `${dist.toFixed(1)} km`;
  };

  const getImageUrl = (image?: string) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `${apiClient.defaults.baseURL}/${image.replace(/^\//, '')}`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: spa.name,
        text: spa.description || `Check out ${spa.name}`,
        url: `${window.location.origin}/besttopspas/${spa.slug}`,
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/besttopspas/${spa.slug}`);
    }
  };

  const getDirectionsUrl = () => {
    if (spa.latitude && spa.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${spa.latitude},${spa.longitude}`;
    }
    if (spa.directions) {
      return spa.directions;
    }
    if (spa.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spa.address)}`;
    }
    return '#';
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="w-4 h-4 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <FaStarHalfAlt key="half" className="w-4 h-4 text-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    );
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg">
      <Link href={`/besttopspas/${spa.slug}`} className="block">
        <div className="relative h-44 bg-slate-200 sm:h-52">
        {spa.spa_images && spa.spa_images.length > 0 ? (
          <img
            src={getImageUrl(spa.spa_images[0]) || ''}
            alt={spa.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-600 to-slate-800">
            <div className="text-5xl font-bold text-white">
              {spa.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-90" />
        
          {showDistance && distance !== undefined && (
            <div className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow-md">
              {formatDistance(distance)} away
            </div>
          )}

          {jobCount !== null && jobCount > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-white shadow-md">
              <FaBriefcase size={11} />
              {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
            </div>
          )}

          {spa.is_verified && (
            <div
              className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-brand-700 px-2.5 py-1 text-xs font-bold text-white shadow-md"
              title="Verified by WorkSpa - Business details checked"
            >
              <FaCheckCircle className="h-3.5 w-3.5" />
              Verified
            </div>
          )}
          </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Business Name */}
        <Link href={`/besttopspas/${spa.slug}`}>
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-950 transition-colors group-hover:text-brand-700 sm:text-xl">
            {capitalizeTitle(spa.name)}
          </h3>
        </Link>

        {/* Category */}
        <p className="mt-1 text-sm font-medium text-slate-500">Spa & Massage</p>

        {/* Rating - Only show if verified (to avoid fake reviews) */}
        {spa.is_verified && spa.rating !== undefined && spa.rating > 0 && (
          <div className="mt-3 flex items-center gap-2">
            {renderStars(spa.rating)}
            <span className="text-sm font-bold text-slate-900">{spa.rating.toFixed(1)}</span>
            {spa.reviews !== undefined && spa.reviews > 0 && (
              <span className="text-sm text-slate-500">({spa.reviews} reviews)</span>
            )}
          </div>
        )}
        {/* Show verified badge instead of fake reviews */}
        {!spa.is_verified && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
              <FaCheckCircle className="w-3.5 h-3.5" />
              <span>Verified Spa</span>
            </div>
          </div>
        )}

        {/* Address */}
        {spa.address && (
          <p className="mt-3 flex gap-2 text-sm leading-5 text-slate-600">
            <FaMapMarkerAlt className="mt-1 shrink-0 text-brand-600" size={13} />
            <span className="line-clamp-2">{spa.address}</span>
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
        {spa.booking_url_website && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const { spaAPI } = await import('@/lib/spa');
                      await spaAPI.trackBookingClick(spa.id);
                    } catch {
                      // Ignore tracking failures
                    } finally {
                      window.open(spa.booking_url_website as string, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
                >
                  <FaCalendarCheck size={15} />
                  <span>Service booking</span>
                </button>
              )}

          {/* Directions Button */}
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
          >
            <FaDirections className="h-4 w-4 text-green-600" />
            <span>Directions</span>
          </a>

          {/* Jobs Button */}
          {jobCount !== null && jobCount > 0 && (
            <Link
              href={`/besttopspas/${spa.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              <FaBriefcase className="h-4 w-4 text-brand-600" />
              <span>Jobs</span>
            </Link>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
          >
            <FaShareAlt className="h-4 w-4 text-slate-500" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}
