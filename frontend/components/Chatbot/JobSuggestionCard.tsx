'use client';

import Link from 'next/link';
import { ChatbotJob } from '@/lib/chatbot';
import { FaMapMarkerAlt, FaRupeeSign, FaBriefcase } from 'react-icons/fa';
import { capitalizeTitle } from '@/lib/text-utils';

interface JobSuggestionCardProps {
  job: ChatbotJob;
}

export default function JobSuggestionCard({ job }: JobSuggestionCardProps) {
  return (
    <Link
      href={job.apply_url}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow mb-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{capitalizeTitle(job.title)}</h3>
          <p className="text-sm text-gray-600 mb-2">{capitalizeTitle(job.spa_name)}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FaMapMarkerAlt size={12} />
              <span>{job.location}</span>
            </div>
            {job.salary && (
              <div className="flex items-center gap-1">
                <FaRupeeSign size={12} />
                <span>{job.salary}</span>
              </div>
            )}
          </div>
        </div>
        <div className="ml-4 text-brand-600">
          <FaBriefcase size={20} />
        </div>
      </div>
    </Link>
  );
}

