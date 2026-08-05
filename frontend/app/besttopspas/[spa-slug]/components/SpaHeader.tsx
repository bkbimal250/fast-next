'use client';

import { Spa } from '@/lib/spa';
import { FaCheckCircle, FaStar, FaRegStar, FaStarHalfAlt, FaMapMarkerAlt, FaEnvelope, FaClock, FaCalendarCheck, FaDirections, FaBriefcase } from 'react-icons/fa';
import { capitalizeTitle } from '@/lib/text-utils';

interface SpaHeaderProps {
  spa: Spa;
  allImages: string[];
  locationNames: {
    country?: string;
    state?: string;
    city?: string;
    area?: string;
  };
  apiUrl: string;
}

export default function SpaHeader({ spa, allImages, locationNames, apiUrl }: SpaHeaderProps) {
  const locationStr = [locationNames.area, locationNames.city]
    .filter(Boolean)
    .join(', ');

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <div key={`full-${i}`} className="text-yellow-400">
            <FaStar size={20} />
          </div>
        ))}
        {hasHalfStar && (
          <div key="half" className="text-yellow-400">
            <FaStarHalfAlt size={20} />
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <div key={`empty-${i}`} className="text-gray-300">
            <FaRegStar size={20} />
          </div>
        ))}
      </div>
    );
  };

  const getImageUrl = (image?: string) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `${apiUrl}/${image.replace(/^\//, '')}`;
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

  return (
    <section className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          {/* Logo/Image */}
          <div className="flex-shrink-0">
            {allImages.length > 0 ? (
              <div className="-mt-12 h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-xl sm:-mt-16 sm:h-32 sm:w-32">
                <img
                  src={getImageUrl(allImages[0])}
                  alt={capitalizeTitle(spa.name)}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-brand-600 to-slate-800 text-4xl font-bold text-white shadow-xl sm:-mt-16 sm:h-32 sm:w-32 sm:text-5xl">
                {capitalizeTitle(spa.name).charAt(0)}
              </div>
            )}
          </div>

          {/* Title and Info */}
          <div className="flex-1 min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl md:text-4xl">
                {capitalizeTitle(spa.name)}
              </h1>
              {spa.is_verified && (
                <span 
                  className="flex items-center gap-1.5 rounded-full bg-brand-700 px-2.5 py-1 text-xs font-bold text-white shadow-sm sm:px-3 sm:py-1.5 sm:text-sm"
                  title="Verified by WorkSpa - Business details checked"
                >
                  <FaCheckCircle size={14} />
                  <span>Verified</span>
                </span>
              )}
              {/* Only show ratings if verified (to avoid fake reviews) */}
              {spa.is_verified && spa.rating !== undefined && spa.reviews !== undefined && spa.rating > 0 && (
                <div className="flex items-center gap-2">
                  {renderStars(spa.rating)}
                  <span className="text-sm font-bold text-slate-900">
                    {spa.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-500">
                    ({spa.reviews} {spa.reviews === 1 ? 'Review' : 'Reviews'})
                  </span>
                </div>
              )}
              {/* Show verified badge instead of fake reviews */}
              {!spa.is_verified && (
                <div className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 sm:text-sm">
                  <FaCheckCircle size={14} />
                  <span>Verified Spa</span>
                </div>
              )}
            </div>

            <div className="mb-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Category</span>
                <span className="mt-0.5 flex items-center gap-2 font-semibold text-slate-900">
                  <FaBriefcase className="text-brand-600" size={13} />
                  Spa & Massage
                </span>
              </div>
              {locationStr && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Location</span>
                  <span className="mt-0.5 flex items-center gap-2 font-semibold text-slate-900">
                    <FaMapMarkerAlt className="text-brand-600" size={13} />
                    {locationStr}
                  </span>
                </div>
              )}
              {(spa.opening_hours || spa.closing_hours) && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Hours</span>
                  <span className="mt-0.5 flex items-center gap-2 font-semibold text-slate-900">
                    <FaClock className="text-brand-600" size={13} />
                    {spa.opening_hours} - {spa.closing_hours}
                  </span>
                </div>
              )}
            </div>

            {/* Location & Contact Info */}
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-600 sm:gap-4">
              {/* {spa.phone && (
                <div className="flex items-center gap-1.5">
                  <div className="text-gray-400 flex-shrink-0">
                    <FaPhone size={16} />
                  </div>
                  <a href={`tel:${spa.phone}`} className="hover:text-brand-600 font-medium transition-colors">
                    {spa.phone}
                  </a>
                </div>
              )} */}
              {spa.email && (
                <div className="flex items-center gap-1.5">
                  <div className="flex-shrink-0 text-slate-400">
                    <FaEnvelope size={16} />
                  </div>
                  <a href={`mailto:${spa.email}`} className="hover:text-brand-600 font-medium transition-colors break-all">
                    {spa.email}
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* {spa.website && (
                <a
                  href={spa.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gold-500 hover:bg-gold-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base"
                >
                  <FaGlobe size={18} />
                  <span>Visit Website</span>
                </a>
              )} */}


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
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 sm:px-5"
                >
                  <FaCalendarCheck size={16} />
                  <span>Book Appointment</span>
                </button>
              )}
              {((spa.latitude && spa.longitude) || spa.address || spa.directions) && (
                <a
                  href={getDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 sm:px-5"
                >
                  <FaDirections size={16} />
                  <span>Get Directions</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

