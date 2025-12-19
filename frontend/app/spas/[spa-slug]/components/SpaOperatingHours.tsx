'use client';

import { Spa } from '@/lib/spa';

interface SpaOperatingHoursProps {
  spa: Spa;
}

export default function SpaOperatingHours({ spa }: SpaOperatingHoursProps) {
  if (!spa.opening_hours && !spa.closing_hours) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
        Operating Hours
      </h3>
      <div className="flex items-center gap-3 text-gray-700">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-semibold text-lg">
            {spa.opening_hours} - {spa.closing_hours}
          </p>
          <p className="text-sm text-gray-500">Daily</p>
        </div>
      </div>
    </div>
  );
}

