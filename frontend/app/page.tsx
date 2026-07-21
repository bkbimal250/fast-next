'use client';

import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import Features from './Features/page';
import ProcessPage from './Process/Page';
import SEOHead from '@/components/SEOHead';
import { jobAPI } from '@/lib/job';
import { StatsSection } from '@/components/StatsSection';
import Areasjobs from '@/components/Areasjobs';
import Featuresjobs from '@/components/Featuresjobs';
import Popularjobs from '@/components/Popularjobs';
import JobCategories from '@/components/JobCategories';

export default function HomePage() {
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [popularJobs, setPopularJobs] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [quickLinkCategories, setQuickLinkCategories] = useState<any[]>([]);

  useEffect(() => {
    // Fetch featured jobs
    const fetchFeaturedJobs = async () => {
      try {
        setLoadingFeatured(true);
        const data = await jobAPI.getAllJobs({ is_featured: true, limit: 6 });
        setFeaturedJobs(data || []);
      } catch (error) {
        console.error('Error fetching featured jobs:', error);
        setFeaturedJobs([]);
      } finally {
        setLoadingFeatured(false);
      }
    };

    // Fetch popular jobs
    const fetchPopularJobs = async () => {
      try {
        setLoadingPopular(true);
        const data = await jobAPI.getPopularJobs(6);
        setPopularJobs(data || []);
      } catch (error) {
        console.error('Error fetching popular jobs:', error);
        setPopularJobs([]);
      } finally {
        setLoadingPopular(false);
      }
    };

    fetchFeaturedJobs();
    fetchPopularJobs();
    fetchQuickLinkCategories();
  }, []);

  // Fetch categories for quick links
  const fetchQuickLinkCategories = async () => {
    try {
      const categories = await jobAPI.getJobCategories();
      // Filter for the specific categories we want to show
      const targetCategoryNames = ['Spa Therapist', 'Spa Receptionist', 'Spa Manager', 'Beautician'];
      const filtered = categories.filter(cat =>
        targetCategoryNames.some(name =>
          cat.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(cat.name.toLowerCase())
        )
      );
      setQuickLinkCategories(filtered);
    } catch (error) {
      console.error('Error fetching categories for quick links:', error);
      // Fallback to default categories if API fails
      setQuickLinkCategories([
        { name: 'Spa Therapist', slug: 'spa-therapist' },
        { name: 'Spa Receptionist', slug: 'spa-receptionist' },
        { name: 'Spa Manager', slug: 'spa-manager' },
        { name: 'Beautician', slug: 'beautician' },
      ]);
    }
  };

  // Generate structured data for homepage
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Work Spa Portal',
    description: 'Find the best Work Spa near you. Apply directly to spas without login.',
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

  // LocalBusiness schema for Mumbai Metropolitan Region
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Work Spa Portal - Mumbai & Navi Mumbai',
    description: 'Leading platform for spa jobs in Mumbai, Navi Mumbai, Thane, Vashi, Bandra, Panvel, Airoli, Sanpada, Kharghar, Belapur, Mulund, Dadar, Kurla and surrounding areas.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in',
    areaServed: [
      {
        '@type': 'City',
        name: 'Mumbai',
      },
      {
        '@type': 'City',
        name: 'Navi Mumbai',
      },
      {
        '@type': 'City',
        name: 'Thane',
      },
      {
        '@type': 'Place',
        name: 'Vashi',
      },
      {
        '@type': 'Place',
        name: 'Bandra',
      },
      {
        '@type': 'Place',
        name: 'Panvel',
      },
      {
        '@type': 'Place',
        name: 'Airoli',
      },
      {
        '@type': 'Place',
        name: 'Sanpada',
      },
      {
        '@type': 'Place',
        name: 'Kharghar',
      },
      {
        '@type': 'Place',
        name: 'Belapur',
      },
      {
        '@type': 'Place',
        name: 'Mulund',
      },
      {
        '@type': 'Place',
        name: 'Dadar',
      },
      {
        '@type': 'Place',
        name: 'Kurla',
      },
    ],
    serviceType: 'Job Portal',
    offers: {
      '@type': 'Offer',
      description: 'Free job listings for spa professionals in Mumbai Metropolitan Region',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Workspa - Work Spa India',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in'}/logo.png`,
    description: 'India\'s leading platform for spa job opportunities',
    sameAs: [
      // Add social media links here when available
    ],
  };

  // Generate enhanced meta description with job examples
  const enhancedDescription = useMemo(() => {
    const baseDescription = "Find the best Work Spa near you. Apply directly to spas without login. Browse thousands of Work Spa by location, salary, and experience.";

    // Get jobs for examples (combine featured and popular, take first 3-4 unique ones)
    const allJobs = [...featuredJobs, ...popularJobs];
    const uniqueJobs = Array.from(
      new Map(allJobs.map(job => [job.id, job])).values()
    ).slice(0, 4);

    if (uniqueJobs.length > 0 && !loadingFeatured && !loadingPopular) {
      const jobExamples = uniqueJobs.map(job => {
        const jobTitle = job.title || 'Spa Job';
        let salaryText = '';

        if (job.salary_min && job.salary_max) {
          const minK = Math.round(job.salary_min / 1000);
          const maxK = Math.round(job.salary_max / 1000);
          salaryText = ` · ₹${minK}k - ₹${maxK}k`;
        } else if (job.salary_min) {
          const minK = Math.round(job.salary_min / 1000);
          salaryText = ` · ₹${minK}k+`;
        }

        return `${jobTitle}${salaryText}`;
      }).join('; ');

      return `${baseDescription} ${jobExamples}. Search for therapist, receptionist, and spa manager positions.`;
    }

    return `${baseDescription} Search for therapist, receptionist, and spa manager positions.`;
  }, [featuredJobs, popularJobs, loadingFeatured, loadingPopular]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Metadata */}
      <SEOHead
        title="Spa Jobs in Mumbai & Navi Mumbai - Therapist Jobs in Bandra, Thane, Vashi, Panvel"
        description="Find spa therapist jobs in Mumbai, Navi Mumbai, Thane, Vashi, Bandra, Panvel, Airoli, Sanpada, Kharghar, Belapur, Mulund, Dadar, Kurla. Apply directly to verified spas without login. 1000+ active spa jobs across Mumbai Metropolitan Region."
        keywords={[
          'spa jobs in mumbai',
          'spa therapist jobs in mumbai',
          'spa jobs in navi mumbai',
          'spa jobs in thane',
          'spa jobs in vashi',
          'spa jobs in bandra',
          'spa jobs in panvel',
          'spa jobs in airoli',
          'spa jobs in sanpada',
          'spa jobs in kharghar',
          'spa jobs in belapur',
          'spa jobs in mulund',
          'spa jobs in dadar',
          'spa jobs in kurla',
          'massage therapist jobs in mumbai',
          'massage therapist jobs in navi mumbai',
          'massage therapist jobs in thane',
          'massage therapist jobs in bandra',
          'spa manager jobs in mumbai',
          'spa manager jobs in navi mumbai',
          'spa manager jobs in thane',
          'beauty therapist jobs in mumbai',
          'beauty therapist jobs in navi mumbai',
          'wellness jobs in mumbai',
          'wellness jobs in navi mumbai',
          'therapist jobs in mumbai',
          'therapist jobs in navi mumbai',
          'therapist jobs in thane',
          'therapist jobs in vashi',
          'therapist jobs in bandra',
          'therapist jobs in malad',
          'therapist jobs in borivali',
          'therapist jobs in kandivali',
          'therapist jobs in mira road',
          'therapist jobs in mira road',
          'female therapist jobs in mumbai',
          'female therapist jobs in navi mumbai',
          'female therapist jobs in thane',
          'female therapist jobs in vashi',
          'female therapist jobs in bandra',
          'female receptionist jobs in mumbai',
          'female receptionist jobs in navi mumbai',
          'female receptionist jobs in thane',
          'female receptionist jobs in vashi',
          'female receptionist jobs in bandra',
          'spa jobs hiring in thane',
          'work spa mumbai',
          'work spa navi mumbai',
          'work spa thane',
          'work spa bandra',
          'work spa vashi',
          'work spa panvel',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Navbar />

      {/* Hero Section with Search */}
      <div className="relative overflow-hidden bg-brand-800 text-white">
        <div className="page-shell py-12 sm:py-16 md:py-20">
          <div className="text-center mb-8 sm:mb-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-200">
              Verified spa hiring across Mumbai region
            </p>
            <h1 className="mx-auto max-w-5xl px-2 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Find Spa Jobs in Mumbai & Navi Mumbai
            </h1>
            <p className="mx-auto mt-4 max-w-4xl px-4 text-base leading-7 text-white/90 sm:text-lg md:text-xl">
              Verified spa jobs in Mumbai, Navi Mumbai, Thane, Vashi, Bandra, Panvel, Airoli, Sanpada, Kharghar, Belapur, Mulund, Dadar, Kurla & more
            </p>
          </div>

          {/* Search Bar - removed hover scale to prevent CLS */}
          <div className="max-w-5xl mx-auto mb-6 sm:mb-8">
            <SearchBar />
          </div>

          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/jobs" className="btn-primary w-full sm:w-auto">
              Browse Jobs
            </Link>
            <Link
              href="/free-listing"
              className="inline-flex w-full items-center justify-center rounded-lg border border-white/25 bg-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/15 sm:w-auto"
            >
              Free Listing for Employers
            </Link>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-2 text-xs sm:gap-3 sm:text-sm md:text-base px-4">
            {quickLinkCategories.length > 0 ? (
              quickLinkCategories.map((category) => (
                <Link
                  key={category.id || category.name}
                  href={`/jobs?job_category=${encodeURIComponent(category.name)}`}
                  className="rounded-full border border-white/20 px-3 py-1.5 font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {category.name} Jobs
                </Link>
              ))
            ) : (
              <>
                <Link href="/jobs?job_category=Spa Therapist" className="rounded-full border border-white/20 px-3 py-1.5 font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white">
                  Spa Therapist Jobs
                </Link>
                <Link href="/jobs?job_category=Spa Receptionist" className="rounded-full border border-white/20 px-3 py-1.5 font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white">
                  Spa Receptionist Jobs
                </Link>
                <Link href="/jobs?job_category=Spa Manager" className="rounded-full border border-white/20 px-3 py-1.5 font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white">
                  Spa Manager Jobs
                </Link>
                <Link href="/jobs?job_category=Beautician" className="rounded-full border border-white/20 px-3 py-1.5 font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white">
                  Beautician Jobs
                </Link>
              </>
            )}
          </div>

        </div>
      </div>

      <StatsSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Featured Jobs Section */}
        <Featuresjobs featuredJobs={featuredJobs} loadingFeatured={loadingFeatured} />

        {/* Popular Jobs Section */}
        <Popularjobs popularJobs={popularJobs} loadingPopular={loadingPopular} />

        <JobCategories />


        {/* Features Section */}

        <Features />

        <ProcessPage />

        <Areasjobs />

      </div>



    </div>
  );
}

