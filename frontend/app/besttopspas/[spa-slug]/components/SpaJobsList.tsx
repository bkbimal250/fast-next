'use client';

import { Job } from '@/lib/job';
import JobCard from '@/components/JobCard';
import { FaBriefcase, FaCheckCircle } from 'react-icons/fa';
import { capitalizeTitle } from '@/lib/text-utils';

interface SpaJobsListProps {
  jobs: Job[];
  spaName: string;
  spaAddress?: string;
  locationStr: string;
}

export default function SpaJobsList({ jobs, spaName, spaAddress, locationStr }: SpaJobsListProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            <FaCheckCircle size={12} />
            Verified hiring
          </div>
          <h2 className="text-xl font-bold leading-tight text-slate-950 sm:text-2xl">
            Jobs at {capitalizeTitle(spaName)}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Apply directly for open roles connected to this spa profile.
          </p>
        </div>
        {jobs.length > 0 && (
          <span className="w-fit rounded-full bg-gold-50 px-4 py-1.5 text-sm font-bold text-gold-800">
            {jobs.length} {jobs.length === 1 ? 'Opening' : 'Openings'}
          </span>
        )}
      </div>

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
            <FaBriefcase size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-950">No job openings available</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Check back later for new opportunities at {capitalizeTitle(spaName)}.
          </p>
        </div>
      )}
    </section>
  );
}

