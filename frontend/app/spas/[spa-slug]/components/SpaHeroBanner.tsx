'use client';

import Link from 'next/link';
import { Spa } from '@/lib/spa';

interface SpaHeroBannerProps {
  spa: Spa;
  allImages: string[];
  locationStr?: string;
  apiUrl: string;
  activeImageIndex: number;
  onImageIndexChange: (index: number) => void;
}

export default function SpaHeroBanner({
  spa,
  allImages,
  locationStr,
  apiUrl,
  activeImageIndex,
  onImageIndexChange,
}: SpaHeroBannerProps) {

  return (
    <div className="relative h-[400px] md:h-[500px] bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden">
      {allImages.length > 0 ? (
        <div className="relative w-full h-full">
          <img
            src={`${apiUrl}/${allImages[activeImageIndex]}`}
            alt={`${spa.name} - ${locationStr || 'SPA'}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 flex items-center justify-center">
          <div className="text-white text-8xl font-bold opacity-50">
            {spa.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Image Navigation */}
      {allImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => onImageIndexChange(index)}
              className={`h-2 rounded-full transition-all ${
                activeImageIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Link
          href="/spa-near-me"
          className="bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      </div>
    </div>
  );
}

