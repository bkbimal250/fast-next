'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { jobAPI, Job, JobCategory } from '@/lib/job';
import PublicEmptyState from './PublicEmptyState';
import PublicJobMiniFilters from './PublicJobMiniFilters';
import PublicJobsGrid from './PublicJobsGrid';
import PublicJobsSkeleton from './PublicJobsSkeleton';

const ITEMS_PER_PAGE = 16;

export default function NearMeJobsClient() {
  const { location: userLocation } = useLocation(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobCount, setJobCount] = useState(0);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [searchText, setSearchText] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const pendingResetRef = useRef(false);

  useEffect(() => {
    jobAPI.getJobCategories(0, 1000).then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    pendingResetRef.current = true;
    setJobs([]);
    setJobCount(0);
    setCurrentPage(1);
  }, [submittedSearch, selectedCategory, userLocation?.latitude, userLocation?.longitude]);

  useEffect(() => {
    if (pendingResetRef.current && currentPage !== 1) return;

    if (pendingResetRef.current && currentPage === 1) {
      pendingResetRef.current = false;
    }

    fetchJobs();
  }, [submittedSearch, selectedCategory, currentPage, userLocation?.latitude, userLocation?.longitude]);

  useEffect(() => {
    const target = loadMoreRef.current;
    const hasMoreJobs = jobCount > 0 && jobs.length < jobCount;

    if (!target || loading || loadingMore || !hasMoreJobs) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setCurrentPage((page) => page + 1);
        }
      },
      { rootMargin: '500px 0px 500px 0px' }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [jobs.length, jobCount, loading, loadingMore]);

  const buildQuery = () => {
    const query: any = {
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      limit: ITEMS_PER_PAGE,
      sort_by: 'recent',
    };

    if (submittedSearch.trim()) query.q = submittedSearch.trim();
    if (selectedCategory) query.job_category = selectedCategory;

    if (userLocation?.latitude && userLocation?.longitude) {
      query.latitude = userLocation.latitude;
      query.longitude = userLocation.longitude;
      query.radius_km = 25;
    }

    return query;
  };

  const fetchJobs = async () => {
    const isFirstPage = currentPage === 1;

    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const query = buildQuery();
      const countQuery = { ...query };
      delete countQuery.skip;
      delete countQuery.limit;
      delete countQuery.sort_by;

      const [data, countData] = await Promise.all([
        jobAPI.getAllJobs(query),
        jobAPI.getJobCount(countQuery),
      ]);

      const activeJobs = data.filter((job) => job.is_active);
      setJobs((previousJobs) => {
        if (isFirstPage) return activeJobs;

        const seen = new Set(previousJobs.map((job) => job.id));
        return [...previousJobs, ...activeJobs.filter((job) => !seen.has(job.id))];
      });
      setJobCount(countData.count || activeJobs.length);
    } catch (error) {
      console.error('Error fetching nearby jobs:', error);
      if (isFirstPage) {
        setJobs([]);
        setJobCount(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const clearFilters = () => {
    setSearchText('');
    setSubmittedSearch('');
    setSelectedCategory('');
  };

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-700">Nearby openings</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            {userLocation?.city ? `Spa jobs near ${userLocation.city}` : 'Spa jobs near me'}
          </h2>
        </div>
        <p className="text-sm font-medium text-slate-500">
          {jobCount > 0 ? `${jobCount} jobs found` : 'Search nearby jobs'}
        </p>
      </div>

      <div className="mb-5">
        <PublicJobMiniFilters
          categories={categories}
          searchText={searchText}
          selectedCategory={selectedCategory}
          onSearchTextChange={setSearchText}
          onCategoryChange={setSelectedCategory}
          onSubmit={() => setSubmittedSearch(searchText.trim())}
          onClear={clearFilters}
        />
      </div>

      {loading ? (
        <PublicJobsSkeleton count={8} />
      ) : jobs.length === 0 ? (
        <PublicEmptyState
          title="No nearby jobs found"
          description="Try another keyword, choose another category, or browse all jobs."
        />
      ) : (
        <>
          <PublicJobsGrid jobs={jobs} />

          <div ref={loadMoreRef} className="mt-8 flex min-h-14 items-center justify-center">
            {loadingMore ? (
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
                Loading more jobs
              </div>
            ) : jobs.length < jobCount ? (
              <span className="text-sm font-medium text-slate-500">Scroll to load more jobs</span>
            ) : (
              <span className="text-sm font-medium text-slate-500">You have reached the end</span>
            )}
          </div>
        </>
      )}
    </section>
  );
}
