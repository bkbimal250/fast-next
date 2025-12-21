'use client';

import { FaImages } from 'react-icons/fa';

interface SpaGalleryProps {
  spaName: string;
  images: string[];
  apiUrl: string;
  onImageClick?: (index: number) => void;
}

export default function SpaGallery({ spaName, images, apiUrl, onImageClick }: SpaGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border border-gray-200">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
        <div className="text-brand-600">
          <FaImages size={18} />
        </div>
        Photo Gallery
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
            onClick={() => onImageClick?.(index + 1)}
          >
            <img
              src={`${apiUrl}/${image}`}
              alt={`${spaName} - Photo ${index + 2}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-900">
                View
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

