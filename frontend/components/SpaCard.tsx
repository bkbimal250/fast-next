'use client';

import Link from 'next/link';
import { Spa } from '@/lib/spa';

interface SpaCardProps {
  spa: Spa;
  distance?: number;
  showDistance?: boolean;
}

export default function SpaCard({ spa, distance, showDistance = true }: SpaCardProps) {
  const formatDistance = (dist: number): string => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m away`;
    }
    return `${dist.toFixed(1)}km away`;
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <Link href={`/spas/${spa.slug}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
        {/* Image */}
        {spa.spa_images && spa.spa_images.length > 0 ? (
          <div className="relative h-48 bg-gray-200">
            <img
              src={`${API_URL}/${spa.spa_images[0]}`}
              alt={spa.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {spa.is_verified && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Verified</span>
              </div>
            )}
            {showDistance && distance !== undefined && (
              <div className="absolute top-2 left-2 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                {formatDistance(distance)}
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <div className="text-white text-4xl font-bold">
              {spa.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {spa.name}
            </h3>
            {!spa.spa_images && showDistance && distance !== undefined && (
              <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2">
                {formatDistance(distance)}
              </span>
            )}
          </div>

          {spa.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{spa.description}</p>
          )}

          <div className="space-y-2 mb-4 text-sm text-gray-600">
            {spa.address && (
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="line-clamp-2 text-xs">{spa.address}</span>
              </div>
            )}
            {spa.phone && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${spa.phone}`} className="text-xs hover:text-primary-600" onClick={(e) => e.stopPropagation()}>
                  {spa.phone}
                </a>
              </div>
            )}
            {(spa.opening_hours || spa.closing_hours) && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs">
                  {spa.opening_hours} - {spa.closing_hours}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <span className="flex-1 bg-blue-600 text-white text-center px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold text-sm">
              View Details
            </span>
            {spa.website && (
              <a
                href={spa.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-semibold text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                Website
              </a>
            )}
          </div>

          {spa.booking_url_website && (
            <a
              href={spa.booking_url_website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full block text-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-semibold text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              Book Now
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
