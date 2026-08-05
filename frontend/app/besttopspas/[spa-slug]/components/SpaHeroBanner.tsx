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
  const getImageUrl = (image?: string) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `${apiUrl}/${image.replace(/^\//, '')}`;
  };

  return (
    <section className="relative h-[300px] overflow-hidden bg-brand-800 sm:h-[380px] md:h-[430px]">
      {allImages.length > 0 ? (
        <div className="relative w-full h-full">
          <img
            src={getImageUrl(allImages[activeImageIndex])}
            alt={`${spa.name} - ${locationStr || 'SPA'}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
          <div className="text-white text-7xl sm:text-8xl font-bold opacity-40">
            {spa.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Image Navigation */}
      {allImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => onImageIndexChange(index)}
              className={`h-2 rounded-full transition-all ${
                activeImageIndex === index ? 'w-8 bg-white shadow-md' : 'w-2 bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/spa-near-me"
          className="flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg backdrop-blur-sm transition hover:bg-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      </div>
    </section>
  );
}

