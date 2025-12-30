'use client';

import { FaCheckCircle } from 'react-icons/fa';

interface JobResponsibilitiesProps {
  responsibilities: string[];
}

export default function JobResponsibilities({ responsibilities }: JobResponsibilitiesProps) {
  if (responsibilities.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="text-brand-600">
          <FaCheckCircle size={18} />
        </div>
        Key Responsibilities
      </h2>
      <ul className="space-y-2.5 text-gray-700">
        {responsibilities.map((resp, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-brand-500 mt-1.5 flex-shrink-0 font-bold">•</span>
            <span className="leading-relaxed text-sm">{resp}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

