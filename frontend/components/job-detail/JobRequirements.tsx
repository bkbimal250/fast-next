'use client';

import { FaCheckCircle } from 'react-icons/fa';

interface JobRequirementsProps {
  requirements: string;
}

export default function JobRequirements({ requirements }: JobRequirementsProps) {
  if (!requirements) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="text-brand-600">
          <FaCheckCircle size={18} />
        </div>
        Requirements
      </h2>
      <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed text-sm">
        {requirements}
      </div>
    </div>
  );
}

