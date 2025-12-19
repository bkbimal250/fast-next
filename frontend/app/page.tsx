'use client';

import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import JobCard from '@/components/JobCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section with Search - Naukri Style */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Find Your Dream SPA Job
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Search from thousands of spa jobs across India
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm">
            <Link href="/jobs?job_type=full-time" className="text-blue-100 hover:text-white underline">
              Full Time Jobs
            </Link>
            <Link href="/jobs?job_type=part-time" className="text-blue-100 hover:text-white underline">
              Part Time Jobs
            </Link>
            <Link href="/spa-near-me" className="text-blue-100 hover:text-white underline">
              SPAs Near Me
            </Link>
            <Link href="/jobs?is_featured=true" className="text-blue-100 hover:text-white underline">
              Featured Jobs
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Jobs Section */}
        {featuredJobs.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Jobs</h2>
              <Link href="/jobs?is_featured=true" className="text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredJobs.slice(0, 6).map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  spaName={job.spa?.name}
                  spaAddress={job.spa?.address}
                  location={`${job.area?.name || ''} ${job.city?.name || ''}`.trim() || 'Location not specified'}
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
          </section>
        )}

        {/* Popular Jobs Section */}
        {popularJobs.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Popular Jobs</h2>
              <Link href="/jobs/popular" className="text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularJobs.slice(0, 6).map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  spaName={job.spa?.name}
                  spaAddress={job.spa?.address}
                  location={`${job.area?.name || ''} ${job.city?.name || ''}`.trim() || 'Location not specified'}
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
          </section>
        )}

        {/* Features Section */}
        <section className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Jobs</h3>
              <p className="text-gray-600">All jobs are verified and from trusted spas</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Application</h3>
              <p className="text-gray-600">Apply with or without creating an account</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Location Based</h3>
              <p className="text-gray-600">Find jobs and spas near your location</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

