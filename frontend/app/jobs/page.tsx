'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import JobCard from '@/components/JobCard';
import JobFilters from '@/components/JobFilters';
import Navbar from '@/components/Navbar';
import { jobAPI, Job } from '@/lib/job';
import Link from 'next/link';

interface FilterState {
  jobTypeId?: number;
  jobCategoryId?: number;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  areaId?: number;
  salaryMin?: number;
  salaryMax?: number;
  experienceMin?: number;
  experienceMax?: number;
  isFeatured?: boolean;
}

export default function JobsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'salary'>('recent');
  
  const jobsPerPage = 20;

  // Initialize filters from URL params
  const initialFilters: FilterState = useMemo(() => {
    const filters: FilterState = {};
    if (searchParams.get('job_type_id')) filters.jobTypeId = parseInt(searchParams.get('job_type_id')!);
    if (searchParams.get('job_category_id')) filters.jobCategoryId = parseInt(searchParams.get('job_category_id')!);
    if (searchParams.get('country_id')) filters.countryId = parseInt(searchParams.get('country_id')!);
    if (searchParams.get('state_id')) filters.stateId = parseInt(searchParams.get('state_id')!);
    if (searchParams.get('city_id')) filters.cityId = parseInt(searchParams.get('city_id')!);
    if (searchParams.get('area_id')) filters.areaId = parseInt(searchParams.get('area_id')!);
    if (searchParams.get('salary_min')) filters.salaryMin = parseInt(searchParams.get('salary_min')!);
    if (searchParams.get('salary_max')) filters.salaryMax = parseInt(searchParams.get('salary_max')!);
    if (searchParams.get('experience_min')) filters.experienceMin = parseInt(searchParams.get('experience_min')!);
    if (searchParams.get('experience_max')) filters.experienceMax = parseInt(searchParams.get('experience_max')!);
    if (searchParams.get('is_featured') === 'true') filters.isFeatured = true;
    return filters;
  }, [searchParams]);

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    fetchJobs();
  }, [filters, currentPage, sortBy]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {
        skip: (currentPage - 1) * jobsPerPage,
        limit: jobsPerPage,
      };

      // Note: Backend currently expects job_type and job_category as strings, but we're passing IDs
      // This might need backend adjustment. For now, we'll pass what the backend expects.
      // You may need to update backend to accept job_type_id and job_category_id instead
      
      if (filters.countryId) params.country_id = filters.countryId;
      if (filters.stateId) params.state_id = filters.stateId;
      if (filters.cityId) params.city_id = filters.cityId;
      if (filters.areaId) params.area_id = filters.areaId;
      if (filters.isFeatured !== undefined) params.is_featured = filters.isFeatured;

      const response = await jobAPI.getAllJobs(params);
      
      let filteredJobs = response;

      // Client-side filtering for fields not supported by backend yet
      if (filters.jobTypeId) {
        filteredJobs = filteredJobs.filter((job) => job.job_type_id === filters.jobTypeId);
      }
      if (filters.jobCategoryId) {
        filteredJobs = filteredJobs.filter((job) => job.job_category_id === filters.jobCategoryId);
      }
      if (filters.salaryMin !== undefined) {
        filteredJobs = filteredJobs.filter((job) => job.salary_min && job.salary_min >= filters.salaryMin!);
      }
      if (filters.salaryMax !== undefined) {
        filteredJobs = filteredJobs.filter((job) => job.salary_max && job.salary_max <= filters.salaryMax!);
      }
      if (filters.experienceMin !== undefined) {
        filteredJobs = filteredJobs.filter((job) => job.experience_years_min && job.experience_years_min >= filters.experienceMin!);
      }
      if (filters.experienceMax !== undefined) {
        filteredJobs = filteredJobs.filter((job) => job.experience_years_max && job.experience_years_max <= filters.experienceMax!);
      }

      // Sorting
      if (sortBy === 'recent') {
        filteredJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sortBy === 'popular') {
        filteredJobs.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      } else if (sortBy === 'salary') {
        filteredJobs.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
      }

      setJobs(filteredJobs);
      setTotalJobs(filteredJobs.length);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key.replace(/([A-Z])/g, '_$1').toLowerCase(), value.toString());
      }
    });
    router.push(`/jobs?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (newSort: 'recent' | 'popular' | 'salary') => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const searchQuery = searchParams.get('q') || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section - Naukri Style */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {searchQuery ? `Jobs for "${searchQuery}"` : 'Find Your Dream SPA Job'}
          </h1>
          <p className="text-blue-100 text-lg">
            {totalJobs > 0 ? `${totalJobs}+ jobs available` : 'Discover thousands of opportunities'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <JobFilters onFilterChange={handleFilterChange} initialFilters={filters} />
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            {/* Sort and View Options - Naukri Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">
                    {loading ? 'Loading...' : `${totalJobs} Jobs Found`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as 'recent' | 'popular' | 'salary')}
                    className="input-field text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="salary">Highest Salary</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Listings */}
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria to find more jobs</p>
                <button
                  onClick={() => {
                    setFilters({});
                    handleFilterChange({});
                  }}
                  className="btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      id={job.id}
                      title={job.title}
                      spaName={job.spa?.name || 'SPA'}
                      spaAddress={job.spa?.address}
                      location={
                        [
                          job.area?.name,
                          job.city?.name,
                          job.state?.name,
                        ]
                          .filter(Boolean)
                          .join(', ') || 'Location not specified'
                      }
                      salaryMin={job.salary_min}
                      salaryMax={job.salary_max}
                      salaryCurrency={job.salary_currency}
                      experienceMin={job.experience_years_min}
                      experienceMax={job.experience_years_max}
                      jobOpeningCount={job.job_opening_count}
                      jobType={job.job_type?.name}
                      jobCategory={job.job_category?.name}
                      slug={job.slug}
                      isFeatured={job.is_featured}
                      viewCount={job.view_count}
                      created_at={job.created_at}
                      description={job.description}
                    />
                  ))}
                </div>

                {/* Pagination - Naukri Style */}
                {totalJobs > jobsPerPage && (
                  <div className="mt-6 flex justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-sm text-gray-700">
                        Page {currentPage} of {Math.ceil(totalJobs / jobsPerPage)}
                      </span>
                      <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={currentPage >= Math.ceil(totalJobs / jobsPerPage)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
