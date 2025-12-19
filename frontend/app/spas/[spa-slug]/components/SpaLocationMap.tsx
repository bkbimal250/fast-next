'use client';

import { Spa } from '@/lib/spa';

interface SpaLocationMapProps {
  spa: Spa;
}

export default function SpaLocationMap({ spa }: SpaLocationMapProps) {
  if (!spa.latitude || !spa.longitude) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
        Location
      </h3>
      <a
        href={`https://www.google.com/maps?q=${spa.latitude},${spa.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        View on Google Maps
      </a>
    </div>
  );
}

