'use client';

import Link from 'next/link';
import JobCard from '@/components/JobCard';

export default function Popularjobs({ popularJobs, loadingPopular }) {
  return (
    <section className="mb-12 sm:mb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Popular Jobs</h2>
          <p className="text-sm sm:text-base text-gray-600">Most viewed and applied positions</p>
        </div>
        <div className="h-6 sm:h-7">
          {popularJobs.length > 0 && (
            <Link href="/jobs/popular" className="text-brand-600 hover:text-brand-700 font-semibold text-base sm:text-lg transition-colors whitespace-nowrap">
              View All →
            </Link>
          )}
        </div>
      </div>
      {loadingPopular ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 sm:p-5 animate-pulse">
              {/* Logo placeholder */}
              <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="flex gap-2 mb-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              {/* Bottom section */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : popularJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularJobs.slice(0, 6).map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              spaName={job.spa?.name}
              spaAddress={job.spa?.address}
              location={
                (() => {
                  const locationParts = [];
                  if (job.area?.name) locationParts.push(job.area.name);
                  if (job.city?.name) locationParts.push(job.city.name);
                  return locationParts.length > 0 ? locationParts.join(', ') : 'Location not specified';
                })()
              }
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
              logoImage={job.spa?.logo_image}
              postedBy={job.created_by_user ? {
                id: job.created_by_user.id,
                name: job.created_by_user.name,
                profile_photo: job.created_by_user.profile_photo,
              } : undefined}
              hr_contact_phone={job.hr_contact_phone}
              required_gender={job.required_gender}
              job_timing={job.job_timing}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-600 text-lg">No popular jobs available at the moment</p>
          <Link href="/jobs" className="inline-block mt-4 text-brand-600 hover:text-brand-700 font-medium">
            Browse all jobs →
          </Link>
        </div>
      )}
    </section>
  );
}
