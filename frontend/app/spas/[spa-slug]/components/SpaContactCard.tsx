'use client';

import { Spa } from '@/lib/spa';

interface SpaContactCardProps {
  spa: Spa;
}

export default function SpaContactCard({ spa }: SpaContactCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
        Contact Information
      </h3>
      <div className="space-y-4 text-sm">
        {spa.address && (
          <div>
            <p className="text-gray-500 mb-1 font-medium">Address</p>
            <p className="text-gray-900 leading-relaxed">{spa.address}</p>
          </div>
        )}
        {spa.phone && (
          <div>
            <p className="text-gray-500 mb-1 font-medium">Phone</p>
            <a href={`tel:${spa.phone}`} className="text-blue-600 hover:text-blue-700 font-medium">
              {spa.phone}
            </a>
          </div>
        )}
        {spa.email && (
          <div>
            <p className="text-gray-500 mb-1 font-medium">Email</p>
            <a href={`mailto:${spa.email}`} className="text-blue-600 hover:text-blue-700 font-medium break-all">
              {spa.email}
            </a>
          </div>
        )}
        {spa.website && (
          <div>
            <p className="text-gray-500 mb-1 font-medium">Website</p>
            <a href={spa.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium break-all">
              {spa.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

