'use client';

import { Job } from '@/lib/job';
import JobCard from '@/components/JobCard';
import { FaBriefcase } from 'react-icons/fa';
import { capitalizeTitle } from '@/lib/text-utils';

interface SpaJobsListProps {
  jobs: Job[];
  spaName: string;
  spaAddress?: string;
  locationStr: string;
}

export default function SpaJobsList({ jobs, spaName, spaAddress, locationStr }: SpaJobsListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-8 bg-brand-600 rounded-full"></span>
          Urgent Hiring at {capitalizeTitle(spaName)}
        </h2>
        {jobs.length > 0 && (
          <span className="bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-semibold">
            {jobs.length} {jobs.length === 1 ? 'Opening' : 'Openings'}
          </span>
        )}
      </div>

      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              logoImage={job.spa?.logo_image || ''}
              spaName={spaName}
              spaAddress={spaAddress}
              location={locationStr || 'Location not specified'}
              salaryMin={job.salary_min}
              salaryMax={job.salary_max}
              salaryCurrency={job.salary_currency}
              experienceMin={job.experience_years_min}
              experienceMax={job.experience_years_max}
              jobOpeningCount={job.job_opening_count}
              jobType={typeof job.job_type === 'string' ? job.job_type : job.job_type?.name}
              jobCategory={typeof job.job_category === 'string' ? job.job_category : job.job_category?.name}
              slug={job.slug}
              isFeatured={job.is_featured}
              viewCount={job.view_count}
              created_at={job.created_at}
              description={job.description}
              hr_contact_phone={job.hr_contact_phone}
              required_gender={job.required_gender}
              job_timing={job.job_timing}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4 text-gray-400">
            <FaBriefcase size={64} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Openings Available</h3>
          <p className="text-gray-600">Check back later for new opportunities at {capitalizeTitle(spaName)}.</p>
        </div>
      )}
    </div>
  );
}

