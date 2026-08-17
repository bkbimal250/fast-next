'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import {
  findLocationIds,
  formatLocationName,
  parseLocationSlug,
  parseLocationSlugSmart,
} from '@/lib/location-utils';
import { jobAPI, Job, JobCategory } from '@/lib/job';
import PublicEmptyState from './PublicEmptyState';
import PublicJobMiniFilters from './PublicJobMiniFilters';
import PublicJobsGrid from './PublicJobsGrid';
import PublicJobsHero from './PublicJobsHero';
import PublicJobsInfoSections from './PublicJobsInfoSections';
import PublicJobsSkeleton from './PublicJobsSkeleton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ITEMS_PER_PAGE = 16;

type LocationJobsClientProps = {
  urlMode: 'slash' | 'hyphen';
};

export default function LocationJobsClient({ urlMode }: LocationJobsClientProps) {
  const params = useParams();
  const locationArray = params?.location as string[] | string | undefined;
  const locationSlug = Array.isArray(locationArray)
    ? locationArray.join('-')
    : locationArray || '';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobCount, setJobCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [searchText, setSearchText] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locationNames, setLocationNames] = useState<{
    area?: string;
    city?: string;
    state?: string;
  }>({});
  const [locationIds, setLocationIds] = useState<{
    areaId?: number;
    cityId?: number;
    stateId?: number;
  }>({});
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const pendingResetRef = useRef(false);

  useEffect(() => {
    jobAPI.getJobCategories(0, 1000).then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!locationSlug) {
      setLoading(false);
      return;
    }

    fetchLocationData();
  }, [locationSlug]);

  useEffect(() => {
    pendingResetRef.current = true;
    setJobs([]);
    setJobCount(0);
    setCurrentPage(1);
  }, [locationIds, submittedSearch, selectedCategory]);

  useEffect(() => {
    if (!locationIds.areaId && !locationIds.cityId && !locationIds.stateId) return;
    if (pendingResetRef.current && currentPage !== 1) return;

    if (pendingResetRef.current && currentPage === 1) {
      pendingResetRef.current = false;
    }

    fetchJobs();
  }, [locationIds, submittedSearch, selectedCategory, currentPage]);

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

  const fetchLocationData = async () => {
    setLoading(true);

    try {
      const parsed = await parseLocationSlugSmart(locationSlug);
      const ids =
        parsed.areaId || parsed.cityId || parsed.stateId
          ? {
              areaId: parsed.areaId,
              cityId: parsed.cityId,
              stateId: parsed.stateId,
            }
          : await findLocationIds(parsed.area, parsed.city, parsed.state);

      setLocationIds(ids);

      if (parsed.area || parsed.city || parsed.state) {
        setLocationNames({
          area: parsed.area,
          city: parsed.city,
          state: parsed.state,
        });
      } else {
        setLocationNames(parseLocationSlug(locationSlug));
      }

      if (!ids.areaId && !ids.cityId && !ids.stateId) {
        setJobs([]);
        setJobCount(0);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      setLocationNames(parseLocationSlug(locationSlug));
      setJobs([]);
      setJobCount(0);
      setLoading(false);
    }
  };

  const buildQuery = () => {
    const query: any = {
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      limit: ITEMS_PER_PAGE,
      sort_by: 'recent',
    };

    if (locationIds.areaId) {
      query.area_id = locationIds.areaId;
    } else if (locationIds.cityId) {
      query.city_id = locationIds.cityId;
    } else if (locationIds.stateId) {
      query.state_id = locationIds.stateId;
    }

    if (submittedSearch.trim()) query.q = submittedSearch.trim();
    if (selectedCategory) query.job_category = selectedCategory;

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
      console.error('Error fetching jobs:', error);
      if (isFirstPage) {
        setJobs([]);
        setJobCount(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const locationDisplayName = useMemo(() => {
    const parts: string[] = [];
    if (locationNames.area) parts.push(locationNames.area);
    if (locationNames.city) parts.push(locationNames.city);
    if (locationNames.state && !locationNames.city) parts.push(locationNames.state);
    return parts.join(', ') || formatLocationName(locationSlug);
  }, [locationNames, locationSlug]);

  const enhancedDescription = useMemo(() => {
    const baseDescription = `Find ${jobCount > 0 ? jobCount : 'verified'} spa jobs in ${locationDisplayName}.`;
    return `${baseDescription} Browse therapist, receptionist, beautician, and spa manager positions with search and category filters.`;
  }, [locationDisplayName, jobCount]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';
  const pageUrl =
    urlMode === 'slash'
      ? `${siteUrl}/spa-jobs-in/${locationSlug}`
      : `${siteUrl}/spa-jobs-in-${locationSlug}`;

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Spa Jobs in ${locationDisplayName}`,
    description: enhancedDescription,
    url: pageUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: jobCount,
      itemListElement: jobs.slice(0, 10).map((job, index) => {
        const logoUrl = job.spa?.logo_image
          ? `${API_URL}${job.spa.logo_image.startsWith('/') ? job.spa.logo_image : `/${job.spa.logo_image}`}`
          : undefined;

        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'JobPosting',
            title: job.title,
            description: job.description?.substring(0, 200) || '',
            identifier: {
              '@type': 'PropertyValue',
              name: job.spa?.name || 'SPA',
              value: job.id.toString(),
            },
            datePosted: job.created_at,
            validThrough: job.expires_at || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            employmentType: job.Employee_type || 'FULL_TIME',
            hiringOrganization: {
              '@type': 'Organization',
              name: job.spa?.name || 'SPA',
              ...(logoUrl && { logo: logoUrl }),
              ...(job.spa?.slug && { sameAs: `${siteUrl}/besttopspas/${job.spa.slug}` }),
            },
            jobLocation: {
              '@type': 'Place',
              address: {
                '@type': 'PostalAddress',
                ...(job.spa?.address && { streetAddress: job.spa.address }),
                addressLocality: job.city?.name || locationDisplayName,
                ...(job.state?.name && { addressRegion: job.state.name }),
                ...(job.postalCode && { postalCode: job.postalCode }),
                addressCountry: job.country?.name || 'IN',
              },
            },
          },
        };
      }),
    },
  };

  const handleSubmitFilters = () => {
    setSubmittedSearch(searchText.trim());
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSubmittedSearch('');
    setSelectedCategory('');
  };

  return (
    <div className="min-h-screen bg-surface-light">
      <SEOHead
        title={`Spa Jobs in ${locationDisplayName} - ${jobCount > 0 ? `${jobCount} Jobs Available` : 'Find Spa Jobs'}`}
        description={enhancedDescription}
        keywords={[
          `spa jobs ${locationDisplayName}`,
          `spa jobs in ${locationDisplayName}`,
          `${locationDisplayName} spa jobs`,
          'spa therapist jobs',
          'massage therapist jobs',
          'spa manager jobs',
        ]}
        url={pageUrl}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />

      <Navbar />

      <PublicJobsHero
        title={`Spa Jobs in ${locationDisplayName}`}
        subtitle="Browse verified spa openings by role, salary, experience, timing, and nearby area. Use quick search and category filters to narrow the list."
        locationLabel={locationDisplayName}
        jobCount={jobCount}
        primaryHref={`/jobs?location=${encodeURIComponent(locationDisplayName)}`}
        primaryLabel="Search this location"
      />

      <main className="page-shell py-8 sm:py-10">
        <div className="space-y-8">
          <PublicJobsInfoSections locationLabel={locationDisplayName} />

          <section>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-brand-700">Latest openings</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Fresh spa jobs in {locationDisplayName}
                </h2>
              </div>
              <Link
                href="/jobs"
                className="text-sm font-semibold text-brand-700 transition hover:text-brand-800"
              >
                View all jobs
              </Link>
            </div>

            <div className="mb-5">
              <PublicJobMiniFilters
                categories={categories}
                searchText={searchText}
                selectedCategory={selectedCategory}
                onSearchTextChange={setSearchText}
                onCategoryChange={setSelectedCategory}
                onSubmit={handleSubmitFilters}
                onClear={handleClearFilters}
              />
            </div>

            {loading ? (
              <PublicJobsSkeleton count={8} />
            ) : jobs.length === 0 ? (
              <PublicEmptyState
                title={`No jobs found in ${locationDisplayName}`}
                description="Try another keyword, select another category, or browse nearby locations."
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
        </div>
      </main>
    </div>
  );
}
