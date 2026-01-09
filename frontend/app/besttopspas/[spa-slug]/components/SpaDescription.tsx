'use client';

import { FaInfoCircle } from 'react-icons/fa';

interface SpaDescriptionProps {
  description: string;
}

export default function SpaDescription({ description }: SpaDescriptionProps) {
  if (!description) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border border-gray-200">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
        <div className="text-brand-600">
          <FaInfoCircle size={18} />
        </div>
        About Us
      </h2>
      <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed text-sm sm:text-base">
        {description}
      </div>
    </div>
  );
}

