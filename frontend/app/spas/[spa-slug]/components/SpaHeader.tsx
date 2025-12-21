'use client';

import { Spa } from '@/lib/spa';
import { FaCheckCircle, FaStar, FaRegStar, FaStarHalfAlt, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaGlobe, FaCalendarCheck, FaDirections } from 'react-icons/fa';

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
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Logo/Image */}
          <div className="flex-shrink-0">
            {allImages.length > 0 ? (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl -mt-12 sm:-mt-16">
                <img
                  src={`${apiUrl}/${allImages[0]}`}
                  alt={spa.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-4xl sm:text-5xl shadow-xl -mt-12 sm:-mt-16 border-4 border-white">
                {spa.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Title and Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{spa.name}</h1>
              {spa.is_verified && (
                <span className="bg-brand-600 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-md">
                  <FaCheckCircle size={14} />
                  <span>Verified</span>
                </span>
              )}
              {spa.rating !== undefined && spa.reviews !== undefined && spa.rating > 0 && (
                <div className="flex items-center gap-2">
                  {renderStars(spa.rating)}
                  <span className="text-sm font-semibold text-gray-900">
                    {spa.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({spa.reviews} {spa.reviews === 1 ? 'Review' : 'Reviews'})
                  </span>
                </div>
              )}
            </div>

            {/* Location & Contact Info */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600 mb-4">
              {locationStr && (
                <div className="flex items-center gap-1.5">
                  <div className="text-gray-400 flex-shrink-0">
                    <FaMapMarkerAlt size={16} />
                  </div>
                  <span className="font-medium">{locationStr}</span>
                </div>
              )}
              {spa.phone && (
                <div className="flex items-center gap-1.5">
                  <div className="text-gray-400 flex-shrink-0">
                    <FaPhone size={16} />
                  </div>
                  <a href={`tel:${spa.phone}`} className="hover:text-brand-600 font-medium transition-colors">
                    {spa.phone}
                  </a>
                </div>
              )}
              {spa.email && (
                <div className="flex items-center gap-1.5">
                  <div className="text-gray-400 flex-shrink-0">
                    <FaEnvelope size={16} />
                  </div>
                  <a href={`mailto:${spa.email}`} className="hover:text-brand-600 font-medium transition-colors break-all">
                    {spa.email}
                  </a>
                </div>
              )}
              {(spa.opening_hours || spa.closing_hours) && (
                <div className="flex items-center gap-1.5">
                  <div className="text-gray-400 flex-shrink-0">
                    <FaClock size={16} />
                  </div>
                  <span className="font-medium">
                    {spa.opening_hours} - {spa.closing_hours}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {spa.website && (
                <a
                  href={spa.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gold-500 hover:bg-gold-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base"
                >
                  <FaGlobe size={18} />
                  <span>Visit Website</span>
                </a>
              )}
              {spa.booking_url_website && (
                <a
                  href={spa.booking_url_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base"
                >
                  <FaCalendarCheck size={18} />
                  <span>Book Appointment</span>
                </a>
              )}
              {((spa.latitude && spa.longitude) || spa.address || spa.directions) && (
                <a
                  href={getDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base"
                >
                  <FaDirections size={18} />
                  <span>Get Directions</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

