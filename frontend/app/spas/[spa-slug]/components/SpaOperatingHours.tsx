'use client';

import { Spa } from '@/lib/spa';
import { FaClock } from 'react-icons/fa';

interface SpaOperatingHoursProps {
  spa: Spa;
}

export default function SpaOperatingHours({ spa }: SpaOperatingHoursProps) {
  if (!spa.opening_hours && !spa.closing_hours) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
        <div className="text-brand-600">
          <FaClock size={16} />
        </div>
        Operating Hours
      </h3>
      <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg border border-brand-100">
        <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 text-brand-600">
          <FaClock size={16} />
        </div>
        <div>
          <p className="font-semibold text-base text-gray-900">
            {spa.opening_hours} - {spa.closing_hours}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Daily</p>
        </div>
      </div>
    </div>
  );
}

