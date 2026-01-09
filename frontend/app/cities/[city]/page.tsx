'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import JobCard from '@/components/JobCard';
import { jobAPI, Job } from '@/lib/job';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';

export default function CityPage({ params }: { params: { city: string } }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobCount, setJobCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState<string>('');
  const [categories, setCategories] = useState<Array<{name: string; slug: string; count: number}>>([]);

  useEffect(() => {
    if (params.city) {
      fetchCityData();
      fetchJobs();
      fetchJobCount();
      fetchCategories();
    }
  }, [params.city]);

  const fetchCityData = async () => {
    try {
      const { locationAPI } = await import('@/lib/location');
      const cities = await locationAPI.getCities();
      const city = cities.find((c: any) => c.slug === params.city);
      if (city) {
        setCityName(city.name);
      } else {
        setCityName(params.city.replace(/-/g, ' '));
      }
    } catch (err) {
      setCityName(params.city.replace(/-/g, ' '));
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { locationAPI } = await import('@/lib/location');
      const cities = await locationAPI.getCities();
      const city = cities.find((c: any) => c.slug === params.city);
      
      const params_query: any = {
        limit: 20,
      };
      
      if (city) {
        params_query.city_id = city.id;
      }

      const data = await jobAPI.getAllJobs(params_query);
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobCount = async () => {
    try {
      const { locationAPI } = await import('@/lib/location');
      const cities = await locationAPI.getCities();
      const city = cities.find((c: any) => c.slug === params.city);
      
      const params_query: any = {};
      if (city) {
        params_query.city_id = city.id;
      }

      const response = await axios.get(`${API_URL}/api/jobs/count`, { params: params_query });
      setJobCount(response.data.count);
    } catch (error) {
      console.error('Error fetching job count:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/jobs/counts-by-location`);
      const cityData = response.data.find((item: any) => item.city_slug === params.city);
      
      if (cityData) {
        // Fetch all categories and their counts for this city
        // This is a simplified version - you might want to enhance this
        setCategories([
          { name: 'Therapist', slug: 'therapist', count: cityData.job_count },
          { name: 'Masseuse', slug: 'masseuse', count: cityData.job_count },
          { name: 'Spa Manager', slug: 'spa-manager', count: cityData.job_count },
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';
  const pageUrl = `${siteUrl}/cities/${params.city}`;

  // Helper function to normalize employment type
  const normalizeEmploymentType = (type: string): string => {
    const normalized = type?.toUpperCase().trim() || 'FULL_TIME';
    const validTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'INTERN', 'VOLUNTEER', 'PER_DIEM', 'OTHER'];
    const typeMap: Record<string, string> = {
      'FULL TIME': 'FULL_TIME', 'PART TIME': 'PART_TIME', 'FULLTIME': 'FULL_TIME', 'PARTTIME': 'PART_TIME',
      'FULL-TIME': 'FULL_TIME', 'PART-TIME': 'PART_TIME',
    };
    const mapped = typeMap[normalized] || normalized;
    return validTypes.includes(mapped) ? mapped : 'FULL_TIME';
  };

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Work Spa in ${cityName}`,
    description: `Find ${jobCount}+ Work Spa in ${cityName}. Browse therapist, masseuse, and spa manager positions.`,
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
            validThrough: (job as any).expires_at || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            employmentType: normalizeEmploymentType((job as any).Employee_type || 'FULL_TIME'),
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
                addressLocality: job.city?.name || cityName,
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
      {
        '@type': 'ListItem',
        position: 3,
        name: `Jobs in ${cityName}`,
        item: pageUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Work Spa in {cityName}
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100">
            {jobCount > 0 ? `${jobCount}+ jobs available` : 'Apply jobs for first call'}
          </p>
        </div>
      </div>

      {/* Category Links */}
      {categories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/jobs/category/${category.slug}/location/${params.city}`}
                className="bg-white border border-gray-200 rounded-lg px-6 py-3 hover:shadow-md transition-shadow"
              >
                <div className="font-semibold text-gray-900">{category.name} Jobs</div>
                <div className="text-sm text-gray-600">{category.count}+ jobs</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Job Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
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
                hr_contact_phone={job.hr_contact_phone}
                required_gender={job.required_gender}
                job_timing={job.job_timing}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
