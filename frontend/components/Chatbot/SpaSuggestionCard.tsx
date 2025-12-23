'use client';

import Link from 'next/link';
import { ChatbotSpa } from '@/lib/chatbot';
import { FaMapMarkerAlt, FaPhone, FaStar } from 'react-icons/fa';

interface SpaSuggestionCardProps {
  spa: ChatbotSpa;
}

export default function SpaSuggestionCard({ spa }: SpaSuggestionCardProps) {
  return (
    <Link
      href={spa.view_url}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow mb-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{spa.name}</h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-1">
              <FaMapMarkerAlt size={12} />
              <span>{spa.location}</span>
            </div>
            {spa.rating && (
              <div className="flex items-center gap-1">
                <FaStar color="#fbbf24" size={12} />
                <span>{spa.rating.toFixed(1)}</span>
              </div>
            )}
            {spa.phone && (
              <div className="flex items-center gap-1">
                <FaPhone size={12} />
                <span>{spa.phone}</span>
              </div>
            )}
          </div>
          {spa.address && (
            <p className="text-xs text-gray-600 mt-1">{spa.address}</p>
          )}
        </div>
        <div className="ml-4">
          <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
            <span className="text-brand-600 font-bold text-sm">SPA</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

