'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  FaArrowRight,
  FaBriefcase,
  FaBuilding,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaSearch,
  FaShieldAlt,
  FaUserTie,
  FaUsers,
} from 'react-icons/fa';
import JobCard from '@/components/JobCard';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import SEOHead from '@/components/SEOHead';
import { jobAPI, Job, JobCategory } from '@/lib/job';

const cityLinks = [
  { label: 'Mumbai', href: '/spa-jobs-in-mumbai' },
  { label: 'Navi Mumbai', href: '/spa-jobs-in-navi-mumbai' },
  { label: 'Thane', href: '/spa-jobs-in-thane' },
  { label: 'Pune', href: '/spa-jobs-in-pune' },
  { label: 'Nashik', href: '/spa-jobs-in-nashik' },
  { label: 'Nagpur', href: '/spa-jobs-in-nagpur' },
];

const roleFallbacks = [
  { name: 'Spa Therapist', href: '/jobs?q=Spa%20Therapist', icon: FaUserTie },
  { name: 'Receptionist', href: '/jobs?q=Receptionist', icon: FaUsers },
  { name: 'Spa Manager', href: '/jobs?q=Spa%20Manager', icon: FaBriefcase },
  { name: 'Beautician', href: '/jobs?q=Beautician', icon: FaShieldAlt },
];

const stats = [
  { label: 'Active jobs', value: '1000+', icon: FaBriefcase },
  { label: 'Verified spas', value: '500+', icon: FaBuilding },
  { label: 'Hiring cities', value: '50+', icon: FaMapMarkerAlt },
  { label: 'Direct apply', value: 'Fast', icon: FaCheckCircle },
];

const steps = [
  {
    title: 'Search by role and area',
    text: 'Find nearby openings for therapist, receptionist, beautician, manager, and support roles.',
  },
  {
    title: 'Compare real job details',
    text: 'Scan salary, experience, timing, openings, location, and employer name before applying.',
  },
  {
    title: 'Apply quickly',
    text: 'Use Quick Apply from the card or open full job details when you need more context.',
  },
];

function getLocation(job: Job) {
  return [job.area?.name, job.city?.name].filter(Boolean).join(', ') || 'Location not specified';
}

function JobSection({
  title,
  eyebrow,
  jobs,
  loading,
  emptyText,
  href,
}: {
  title: string;
  eyebrow: string;
  jobs: Job[];
  loading: boolean;
  emptyText: string;
  href: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-700">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">{title}</h2>
        </div>
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800">
          View all
          <FaArrowRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-medium text-slate-600">
          {emptyText}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {jobs.slice(0, 3).map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              spaName={job.spa?.name}
              spaAddress={job.spa?.address}
              location={getLocation(job)}
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
      )}
    </section>
  );
}

export default function HomePage() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [popularJobs, setPopularJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      setLoadingFeatured(true);
      setLoadingPopular(true);

      const [featured, popular, jobCategories] = await Promise.all([
        jobAPI.getAllJobs({ is_featured: true, limit: 6 }),
        jobAPI.getPopularJobs(6),
        jobAPI.getJobCategories(0, 100),
      ]);

      setFeaturedJobs(featured || []);
      setPopularJobs(popular || []);
      setCategories(jobCategories || []);
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      setFeaturedJobs([]);
      setPopularJobs([]);
      setCategories([]);
    } finally {
      setLoadingFeatured(false);
      setLoadingPopular(false);
    }
  };

  const roleLinks = useMemo(() => {
    const preferredNames = ['Spa Therapist', 'Spa Receptionist', 'Spa Manager', 'Beautician'];
    const matched = preferredNames
      .map((name) => categories.find((category) =>
        category.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(category.name.toLowerCase())
      ))
      .filter(Boolean) as JobCategory[];

    if (matched.length === 0) return roleFallbacks;

    return matched.slice(0, 4).map((category, index) => ({
      name: category.name,
      href: `/jobs?job_category=${encodeURIComponent(category.name)}`,
      icon: roleFallbacks[index]?.icon || FaBriefcase,
    }));
  }, [categories]);

  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Workspa',
    description: 'Find verified spa jobs and spa hiring opportunities across India.',
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
    name: 'Workspa',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in'}/uploads/navbar.webp`,
    description: 'India leading platform for spa job opportunities.',
  };

  return (
    <div className="min-h-screen bg-surface-light">
      <Navbar />
      <SEOHead
        title="Spa Jobs in Mumbai, Navi Mumbai, Thane & Pune | Workspa"
        description="Find verified spa therapist, receptionist, beautician, massage therapist, and spa manager jobs. Search by role, salary, experience, city, and area."
        keywords={[
          'spa jobs in mumbai',
          'spa therapist jobs',
          'spa jobs near me',
          'massage therapist jobs',
          'spa manager jobs',
          'beautician jobs',
          'spa receptionist jobs',
          'free spa listing',
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />


      <section className="relative overflow-hidden bg-brand-900 text-white">
        <Image
          src="/uploads/about-hero.webp"
          alt=""
          fill
          priority
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brand-900/75" />
        <div className="page-shell relative py-12 sm:py-16 lg:py-20">
          <div className="max-w-5xl">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white">
                <FaShieldAlt size={13} />
                Verified spa hiring
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white">
                <FaMapMarkerAlt size={13} />
                Mumbai, Navi Mumbai, Thane, Pune
              </span>
            </div>
            <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-4xl lg:text-6xl">
              Find spa jobs that match your role, city, and salary
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
              Search verified spa therapist, receptionist, beautician, massage therapist, and manager jobs from trusted spa businesses.
            </p>
          </div>

          <div className="mt-8 max-w-5xl">
            <SearchBar />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/jobs" className="btn-primary">
              Browse all jobs
            </Link>
            <Link
              href="/free-listing"
              className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            >
              Add free listing
            </Link>
          </div>
        </div>
      </section>

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="page-shell py-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <Icon size={17} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-950">{stat.value}</p>
                      <p className="text-sm font-semibold text-slate-600">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="page-shell py-8 sm:py-10">
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase text-brand-700">Popular roles</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">Browse by job category</h2>
                </div>
                <Link href="/jobs" className="text-sm font-bold text-brand-700 hover:text-brand-800">
                  View all categories
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {roleLinks.map((role) => {
                  const Icon = role.icon;
                  return (
                    <Link
                      key={role.name}
                      href={role.href}
                      className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <Icon size={17} />
                      </div>
                      <h3 className="mt-3 font-bold text-slate-950">{role.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">Open verified jobs</p>
                    </Link>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase text-brand-700">Top cities</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Maharashtra hiring hubs</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {cityLinks.map((city) => (
                  <Link
                    key={city.href}
                    href={city.href}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {city.label}
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="page-shell space-y-6 pb-8 sm:pb-10">
          <JobSection
            title="Featured spa jobs"
            eyebrow="Recommended"
            jobs={featuredJobs}
            loading={loadingFeatured}
            emptyText="Featured jobs are being updated. Browse all jobs for the latest openings."
            href="/jobs?is_featured=true"
          />

          <JobSection
            title="Popular jobs right now"
            eyebrow="Trending"
            jobs={popularJobs}
            loading={loadingPopular}
            emptyText="Popular jobs are being updated. Check all jobs for fresh openings."
            href="/jobs/popular"
          />
        </section>

        <section className="bg-white">
          <div className="page-shell py-8 sm:py-10">
            <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
              <div className="rounded-lg border border-slate-200 bg-brand-800 p-5 text-white shadow-sm">
                <FaBuilding size={24} />
                <h2 className="mt-4 text-2xl font-bold">Recruiters can start with one business listing</h2>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  Add your spa or shop, verify details, then post jobs attached to your business profile.
                </p>
                <Link
                  href="/free-listing"
                  className="mt-5 inline-flex rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-brand-800 transition hover:bg-brand-50"
                >
                  Create free listing
                </Link>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase text-brand-700">How Workspa helps candidates</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">A faster way to compare spa jobs</h2>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {steps.map((step, index) => (
                    <div key={step.title} className="rounded-lg bg-slate-50 p-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <h3 className="mt-4 font-bold text-slate-950">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell py-8 sm:py-10">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase text-brand-700">Candidate safety</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Apply with clearer job information</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  Workspa job cards are designed for quick comparison: salary range, location, experience, gender requirement when listed, timing, openings, and employer name.
                </p>
              </div>
              <div className="grid gap-2 text-sm font-semibold text-slate-700">
                <p className="flex items-center gap-2">
                  <FaCheckCircle className="text-brand-700" />
                  Do not pay money for interviews
                </p>
                <p className="flex items-center gap-2">
                  <FaCheckCircle className="text-brand-700" />
                  Meet at official business addresses
                </p>
                <p className="flex items-center gap-2">
                  <FaCheckCircle className="text-brand-700" />
                  Check salary and timing before applying
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
