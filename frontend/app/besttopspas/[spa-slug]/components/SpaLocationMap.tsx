'use client';

import { Spa } from '@/lib/spa';
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';

interface SpaLocationMapProps {
  spa: Spa;
}

export default function SpaLocationMap({ spa }: SpaLocationMapProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string>('#');

  useEffect(() => {
    // Try to extract coordinates or create embed URL from directions
    let url: string | null = null;
    let mapLink: string = '#';

    // Priority 1: Use latitude/longitude if available
    if (spa.latitude && spa.longitude) {
      // Create embed URL using coordinates (no API key needed for basic embed)
      url = `https://www.google.com/maps?q=${spa.latitude},${spa.longitude}&output=embed`;
      mapLink = `https://www.google.com/maps?q=${spa.latitude},${spa.longitude}`;
    }
    // Priority 2: Parse directions URL
    else if (spa.directions) {
      const directionsUrl = spa.directions;
      mapLink = directionsUrl;
      
      // Check if it's already an embed URL
      if (directionsUrl.includes('google.com/maps/embed')) {
        url = directionsUrl;
      }
      // Check if it's a place URL - extract place ID or name
      else if (directionsUrl.includes('/place/')) {
        const placeMatch = directionsUrl.match(/\/place\/([^/]+)/);
        if (placeMatch) {
          const placeId = placeMatch[1].replace(/\+/g, ' ');
          // Use the place in the embed URL
          url = `https://www.google.com/maps?q=${encodeURIComponent(placeId)}&output=embed`;
        }
      }
      // Try to extract coordinates from URL
      else {
        const coordMatch = directionsUrl.match(/[?&](?:q|ll|center|destination)=([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)/);
        if (coordMatch) {
          const lat = coordMatch[1];
          const lng = coordMatch[2];
          url = `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
        }
        // Try to extract query parameter
        else {
          try {
            const urlObj = new URL(directionsUrl);
            const query = urlObj.searchParams;
            
            if (query.has('q')) {
              const queryStr = query.get('q') || '';
              url = `https://www.google.com/maps?q=${encodeURIComponent(queryStr)}&output=embed`;
            } else if (query.has('destination')) {
              const dest = query.get('destination') || '';
              url = `https://www.google.com/maps?q=${encodeURIComponent(dest)}&output=embed`;
            }
          } catch (e) {
            // If URL parsing fails, try to use the directions URL directly
            url = `${directionsUrl}&output=embed`;
          }
        }
      }
    }
    // Priority 3: Use address
    else if (spa.address) {
      url = `https://www.google.com/maps?q=${encodeURIComponent(spa.address)}&output=embed`;
      mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spa.address)}`;
    }

    setEmbedUrl(url);
    setMapUrl(mapLink);
  }, [spa.latitude, spa.longitude, spa.directions, spa.address]);

  // Don't render if we have no location data
  if (!spa.latitude && !spa.longitude && !spa.directions && !spa.address) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-brand-600 rounded-full"></span>
        Location
      </h3>
      
      {embedUrl ? (
        <div className="space-y-3">
          <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden border border-gray-200">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            />
          </div>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-gold-500 hover:bg-gold-600 text-white text-center px-4 py-2.5 sm:py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            <FaMapMarkerAlt size={16} />
            <span>Open in Google Maps</span>
            <FaExternalLinkAlt size={12} />
          </a>
        </div>
      ) : (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-gold-500 hover:bg-gold-600 text-white text-center px-4 py-2.5 sm:py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          <FaMapMarkerAlt size={16} />
          <span>View on Google Maps</span>
          <FaExternalLinkAlt size={12} />
        </a>
      )}
    </div>
  );
}

