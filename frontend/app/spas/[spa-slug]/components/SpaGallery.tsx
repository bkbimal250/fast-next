'use client';

import { useState } from 'react';

interface SpaGalleryProps {
  spaName: string;
  images: string[];
  apiUrl: string;
  onImageClick?: (index: number) => void;
}

export default function SpaGallery({ spaName, images, apiUrl, onImageClick }: SpaGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
        Photo Gallery
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

