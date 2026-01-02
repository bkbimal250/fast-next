'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import JobCard from '@/components/JobCard';
import Navbar from '@/components/Navbar';
import Pagination from '@/components/Pagination';
import { jobAPI, Job } from '@/lib/job';
import Link from 'next/link';
import SEOHead from '@/components/SEOHead';

function PopularJobsContent() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchPopularJobs();
  }, [currentPage]);

  const fetchPopularJobs = async () => {
    setLoading(true);
    try {
      // Fetch popular jobs - backend returns sorted by view_count
      const data = await jobAPI.getPopularJobs(1000); // Get more to allow pagination
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching popular jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Paginate jobs
  const paginatedJobs = jobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';

  // Generate dynamic metadata based on job count
  const metadataTitle = useMemo(() => {
    if (loading) {
      return 'Popular SPA Jobs - Most Viewed Job Opportunities';
    }
    if (jobs.length > 0) {
      return `Popular SPA Jobs - ${jobs.length} Most Viewed Job Opportunities`;
    }
    return 'Popular SPA Jobs - Most Viewed Job Opportunities';
  }, [jobs.length, loading]);

  const metadataDescription = useMemo(() => {
    if (loading) {
      return 'Browse the most popular and viewed spa jobs across India. Find trending opportunities for therapists, managers, and wellness professionals.';
    }
    if (jobs.length > 0) {
      return `Browse ${jobs.length} most popular and viewed spa jobs across India. Find trending opportunities for therapists, managers, and wellness professionals.`;
    }
    return 'Browse the most popular and viewed spa jobs across India. Find trending opportunities for therapists, managers, and wellness professionals.';
  }, [jobs.length, loading]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={metadataTitle}
        description={metadataDescription}
        keywords={[
          'popular spa jobs',
          'trending spa jobs',
          'most viewed spa jobs',
          'top spa jobs',
          'spa therapist jobs',
          'spa manager jobs',
        ]}
        url={`${siteUrl}/jobs/popular`}
      />
      <Navbar />

      {/* Hero Section */}
      <div className="bg-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                Popular SPA Jobs
              </h1>
              <p className="text-white/90 text-base sm:text-lg">
                {loading ? 'Loading...' : `${jobs.length} most viewed job opportunities`}
              </p>
            </div>
            <Link
              href="/jobs"
              className="px-4 py-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium text-sm sm:text-base"
            >
              View All Jobs
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No popular jobs found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Check back later for trending job opportunities</p>
            <Link
              href="/jobs"
              className="inline-block px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors"
            >
              Browse All Jobs
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedJobs.map((job) => (
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
                />
              ))}
            </div>

            {/* Pagination */}
            {jobs.length > itemsPerPage && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalItems={jobs.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PopularJobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
        </div>
      </div>
    }>
      <PopularJobsContent />
    </Suspense>
  );
}

