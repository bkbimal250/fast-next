'use client';

import { FaBriefcase } from 'react-icons/fa';

interface JobDescriptionProps {
  description: string;
}

export default function JobDescription({ description }: JobDescriptionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="text-brand-600">
          <FaBriefcase size={18} />
        </div>
        Job Description
      </h2>
      <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed text-sm">
        {description}
      </div>
    </div>
  );
}

