'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import JobCard from '@/components/JobCard';
import JobFilters from '@/components/JobFilters';
import SubscribeForm from '@/components/SubscribeForm';
import Navbar from '@/components/Navbar';
import Pagination from '@/components/Pagination';
import { jobAPI, Job } from '@/lib/job';
import Link from 'next/link';
import { useLocation } from '@/hooks/useLocation';
import { FaMapMarkerAlt, FaCrosshairs } from 'react-icons/fa';

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
  const [totalJobs, setTotalJobs] = useState(0);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'salary'>('recent');
  const [filters, setFilters] = useState<FilterState>({});

  const searchQuery = searchParams.get('q') || '';
  const locationQuery = searchParams.get('location') || '';

  const { location: userLocation, loading: locationLoading } = useLocation(false);
  const [useNearMe, setUseNearMe] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [searchParams, sortBy, filters, useNearMe, userLocation]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: 20,
      };

      if (searchQuery) {
        params.q = searchQuery;
      }

      if (locationQuery) {
        params.location = locationQuery;
      }

      // Add location-based search if near me is enabled
      if (useNearMe && userLocation?.latitude && userLocation?.longitude) {
        params.latitude = userLocation.latitude;
        params.longitude = userLocation.longitude;
        params.radius_km = 10; // 10km radius
      }

      // Apply filters
      if (filters.jobTypeId) params.job_type_id = filters.jobTypeId;
      if (filters.jobCategoryId) params.job_category_id = filters.jobCategoryId;
      if (filters.countryId) params.country_id = filters.countryId;
      if (filters.stateId) params.state_id = filters.stateId;
      if (filters.cityId) params.city_id = filters.cityId;
      if (filters.areaId) params.area_id = filters.areaId;
      if (filters.salaryMin) params.salary_min = filters.salaryMin;
      if (filters.salaryMax) params.salary_max = filters.salaryMax;
      if (filters.experienceMin) params.experience_years_min = filters.experienceMin;
      if (filters.experienceMax) params.experience_years_max = filters.experienceMax;
      if (filters.isFeatured !== undefined) params.is_featured = filters.isFeatured;

      const data = await jobAPI.getAllJobs(params);
      setJobs(data);
      setTotalJobs(data.length);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: 'recent' | 'popular' | 'salary') => {
    setSortBy(newSort);
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';

  // Generate structured data for job listings page
  const jobsListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'SPA Jobs',
    description: `Browse ${totalJobs}+ spa jobs across India. Find therapist, masseuse, and spa manager positions.`,
    url: `${siteUrl}/jobs`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalJobs,
      itemListElement: jobs.slice(0, 10).map((job, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'JobPosting',
          title: job.title,
          description: job.description?.substring(0, 200),
          datePosted: job.created_at,
          hiringOrganization: {
            '@type': 'Organization',
            name: job.spa?.name || 'SPA',
          },
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: job.city?.name || '',
            },
          },
        },
      })),
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Jobs',
        item: `${siteUrl}/jobs`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobsListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      
      {/* Hero Section - Naukri Style */}
      <div className="bg-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            {searchQuery ? `Jobs for "${searchQuery}"` : 'Find Your Dream SPA Job'}
          </h1>
          <p className="text-white/90 text-base sm:text-lg">
            {totalJobs > 0 ? `${totalJobs}+ jobs available` : 'Discover thousands of opportunities'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <JobFilters 
                onFilterChange={handleFilterChange} 
                initialFilters={filters}
                userLocation={userLocation}
                onNearMeToggle={setUseNearMe}
                useNearMe={useNearMe}
              />
              <SubscribeForm />
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            {/* Sort and View Options - Naukri Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">
                    {loading ? 'Loading...' : `${totalJobs} Jobs Found`}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <span className="text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as 'recent' | 'popular' | 'salary')}
                    className="input-field text-xs sm:text-sm border-gray-300 focus:border-brand-500 focus:ring-brand-500 flex-1 sm:flex-none"
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Try adjusting your filters or search criteria to find more jobs</p>
                <button
                  onClick={() => {
                    setFilters({});
                    handleFilterChange({});
                  }}
                  className="btn-primary text-sm sm:text-base px-6 py-2.5"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
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
                />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
