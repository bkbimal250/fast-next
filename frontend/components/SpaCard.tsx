'use client';

import Link from 'next/link';
import { Spa } from '@/lib/spa';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { FaGlobe, FaDirections, FaBriefcase, FaShareAlt, FaCheckCircle, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
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

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: spa.name,
        text: spa.description || `Check out ${spa.name}`,
        url: `${window.location.origin}/spas/${spa.slug}`,
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/spas/${spa.slug}`);
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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Image Section */}
      <div className="relative h-48 sm:h-56 bg-gray-200">
        {spa.spa_images && spa.spa_images.length > 0 ? (
          <img
            src={spa.spa_images[0].startsWith('http') ? spa.spa_images[0] : apiClient.defaults.baseURL + '/' + spa.spa_images[0].replace(/^\//, '')}
            alt={spa.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
            <div className="text-white text-4xl sm:text-5xl font-bold">
              {spa.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        {/* Distance Badge - Bottom Left */}
        {showDistance && distance !== undefined && (
          <div className="absolute bottom-2 left-2 bg-white px-3 py-1 rounded-md shadow-md">
            <span className="text-sm font-semibold text-gray-900">{formatDistance(distance)}</span>
          </div>
        )}

        {/* Verified Badge - Top Right */}
        {spa.is_verified && (
          <div 
            className="absolute top-2 right-2 bg-brand-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg cursor-help"
            title="Verified by WorkSpa - Business details checked"
          >
            <FaCheckCircle className="w-4 h-4" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Business Name */}
        <Link href={`/besttopspas/${spa.slug}`}>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 hover:text-brand-600 transition-colors">
            {capitalizeTitle(spa.name)}
          </h3>
        </Link>

        {/* Category */}
        <p className="text-sm text-gray-500 mb-3">Spa & Massage</p>

        {/* Rating - Only show if verified (to avoid fake reviews) */}
        {spa.is_verified && spa.rating !== undefined && spa.rating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            {renderStars(spa.rating)}
            <span className="text-sm font-semibold text-gray-900">{spa.rating.toFixed(1)}</span>
            {spa.reviews !== undefined && spa.reviews > 0 && (
              <span className="text-sm text-gray-600">({spa.reviews} reviews)</span>
            )}
          </div>
        )}
        {/* Show verified badge instead of fake reviews */}
        {!spa.is_verified && (
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 border border-brand-200">
              <FaCheckCircle className="w-3.5 h-3.5" />
              <span>Verified Spa</span>
            </div>
          </div>
        )}

        {/* Address */}
        {spa.address && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{spa.address}</p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Website Button */}
          {spa.website && (
            <a
              href={spa.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 flex-1 sm:flex-none min-w-[100px]"
            >
              <FaGlobe className="w-5 h-5 text-brand-600" />
              <span>Website</span>
            </a>
          )}

          {/* Directions Button */}
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 flex-1 sm:flex-none min-w-[100px]"
          >
            <FaDirections className="w-5 h-5 text-green-600" />
            <span>Directions</span>
          </a>

          {/* Jobs Button */}
          {jobCount !== null && jobCount > 0 && (
            <Link
              href={`/besttopspas/${spa.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 flex-1 sm:flex-none min-w-[100px]"
            >
              <FaBriefcase className="w-5 h-5 text-purple-600" />
              <span>{jobCount} {jobCount === 1 ? 'Job' : 'Jobs'} open</span>
            </Link>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 flex-1 sm:flex-none min-w-[100px]"
          >
            <FaShareAlt className="w-5 h-5 text-gray-600" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
