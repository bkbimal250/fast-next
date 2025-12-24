'use client';

import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import JobCard from '@/components/JobCard';
import Features from './Features/page';
import ProcessPage from './Process/Page';
import SEOHead from '@/components/SEOHead';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HomePage() {
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [popularJobs, setPopularJobs] = useState<any[]>([]);

  useEffect(() => {
    // Fetch featured jobs
    axios.get(`${API_URL}/api/jobs?is_featured=true&limit=6`)
      .then(res => setFeaturedJobs(res.data))
      .catch(console.error);

    // Fetch popular jobs
    axios.get(`${API_URL}/api/jobs/popular?limit=6`)
      .then(res => setPopularJobs(res.data))
      .catch(console.error);
  }, []);

  // Generate structured data for homepage
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SPA Jobs Portal',
    description: 'Find the best spa jobs near you. Apply directly to spas without login.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in'}/jobs?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Workspa - SPA Jobs India',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in'}/logo.png`,
    description: 'India\'s leading platform for spa job opportunities',
    sameAs: [
      // Add social media links here when available
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Metadata */}
      <SEOHead
        title="SPA Jobs Near Me - Find Spa Jobs in Your City"
        description="Find the best spa jobs near you. Apply directly to spas without login. Browse thousands of spa jobs by location, salary, and experience. Search for therapist, masseuse, and spa manager positions."
        keywords={[
          'spa jobs',
          'spa therapist jobs',
          'massage therapist jobs',
          'spa manager jobs',
          'beauty spa jobs',
          'wellness jobs',
          'spa jobs near me',
          'spa careers',
          'spa employment',
          'spa hiring',
        ]}
      />
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Navbar />
      
      {/* Hero Section with Search */}
      <div className="bg-brand-800 text-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative z-10">
          <div className="text-center mb-8 sm:mb-10 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight px-2">
              Find Trusted Spa Jobs Across India
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 px-4">
              Verified spa jobs for therapists, managers & wellness professionals
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-5xl mx-auto mb-6 sm:mb-8 transform transition-all duration-300 hover:scale-[1.01]">
            <SearchBar />
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 sm:mt-10 text-xs sm:text-sm md:text-base px-4">
            <Link href="/jobs?job_type=full-time" className="text-white/80 hover:text-white underline transition-colors font-medium px-2 py-1">
              Full Time Jobs
            </Link>
            <Link href="/jobs?job_type=part-time" className="text-white/80 hover:text-white underline transition-colors font-medium px-2 py-1">
              Part Time Jobs
            </Link>
            <Link href="/spa-near-me" className="text-white/80 hover:text-white underline transition-colors font-medium px-2 py-1">
              SPAs Near Me
            </Link>
            <Link href="/jobs?is_featured=true" className="text-white/80 hover:text-white underline transition-colors font-medium px-2 py-1">
              Featured Jobs
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Featured Jobs Section */}
        <section className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Featured Jobs</h2>
              <p className="text-sm sm:text-base text-gray-600">Handpicked opportunities from top spas</p>
            </div>
            {featuredJobs.length > 0 && (
              <Link href="/jobs?is_featured=true" className="text-brand-600 hover:text-brand-700 font-semibold text-base sm:text-lg transition-colors whitespace-nowrap">
                View All →
              </Link>
            )}
          </div>
          {featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.slice(0, 6).map((job) => (
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
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 text-lg">No featured jobs available at the moment</p>
              <Link href="/jobs" className="inline-block mt-4 text-brand-600 hover:text-brand-700 font-medium">
                Browse all jobs →
              </Link>
            </div>
          )}
        </section>

        {/* Popular Jobs Section */}
        <section className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Popular Jobs</h2>
              <p className="text-sm sm:text-base text-gray-600">Most viewed and applied positions</p>
            </div>
            {popularJobs.length > 0 && (
              <Link href="/jobs/popular" className="text-brand-600 hover:text-brand-700 font-semibold text-base sm:text-lg transition-colors whitespace-nowrap">
                View All →
              </Link>
            )}
          </div>
          {popularJobs.length > 0 ? (
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


        {/* Features Section */}

        <Features />

        <ProcessPage />


      </div>


      
    </div>
  );
}

