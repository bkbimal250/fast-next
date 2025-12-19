'use client';

import { Job } from '@/lib/job';
import JobCard from '@/components/JobCard';

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
          <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
          Available Job Positions
        </h2>
        {jobs.length > 0 && (
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold">
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
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Openings Available</h3>
          <p className="text-gray-600">Check back later for new opportunities at {spaName}.</p>
        </div>
      )}
    </div>
  );
}

