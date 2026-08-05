import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FaBriefcase,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaRegBuilding,
  FaSearchLocation,
  FaUserTie,
} from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import { NearMeJobsClient, PublicJobsHero } from '@/components/publicjobs';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';

const roleCards = [
  {
    title: 'Spa Therapist',
    description: 'Massage, wellness, body therapy, and treatment-room roles.',
    href: '/jobs?q=Spa%20Therapist',
    icon: FaUserTie,
  },
  {
    title: 'Receptionist',
    description: 'Front desk, booking, guest handling, and billing support jobs.',
    href: '/jobs?q=Receptionist',
    icon: FaRegBuilding,
  },
  {
    title: 'Spa Manager',
    description: 'Operations, team handling, customer care, and sales roles.',
    href: '/jobs?q=Spa%20Manager',
    icon: FaBriefcase,
  },
  {
    title: 'Beautician',
    description: 'Salon, skin care, grooming, and beauty service openings.',
    href: '/jobs?q=Beautician',
    icon: FaCheckCircle,
  },
];

const searchSteps = [
  'Choose your current city or nearby area',
  'Compare salary, timing, experience, and employer details',
  'Open the job card and apply directly with your contact details',
];

export const metadata: Metadata = {
  title: 'Spa Jobs Near Me | Workspa',
  description:
    'Find spa therapist, receptionist, beautician, housekeeping, and spa manager jobs near you. Browse verified spa jobs and apply quickly.',
  alternates: { canonical: `${siteUrl}/spa-jobs-near-me` },
};

export default function SpaJobsNearMePage() {
  return (
    <div className="min-h-screen bg-surface-light">
      <Navbar />

      <PublicJobsHero
        title="Spa Jobs Near Me"
        subtitle="Search nearby spa jobs with a job-portal layout built for fast comparison. Browse by role, city, salary, experience, timing, and verified business details."
        locationLabel="Nearby jobs"
        primaryHref="/jobs"
        primaryLabel="Browse nearby jobs"
      />

      <main className="page-shell py-8 sm:py-10">
        <div className="space-y-8">
          <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <FaSearchLocation size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase text-brand-700">Near me search</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    Find local spa jobs without scrolling through unrelated openings
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Workspa organizes nearby spa jobs so candidates can quickly scan business name,
                    role, salary range, area, openings, and posting freshness before applying.
                  </p>
                </div>
              </div>
            </div>

            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Quick city search</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Gurgaon'].map((city) => (
                  <Link
                    key={city}
                    href={`/spa-jobs-in-${city.toLowerCase()}`}
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </aside>
          </section>

          <NearMeJobsClient />

          <section>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-brand-700">Popular nearby roles</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Browse by job category</h2>
              </div>
              <Link href="/jobs" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                View all jobs
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {roleCards.map((role) => {
                const Icon = role.icon;

                return (
                  <Link
                    key={role.title}
                    href={role.href}
                    className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-950 group-hover:text-brand-700">
                      {role.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{role.description}</p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <FaMapMarkerAlt className="text-brand-700" size={24} />
              <h2 className="mt-4 text-xl font-bold text-slate-950">Designed for local hiring</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Candidates can move from city pages to job details quickly, while recruiters can
                list a business and post roles attached to that business.
              </p>
              <Link
                href="/free-listing"
                className="mt-5 inline-flex rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Add free listing
              </Link>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">How candidates find nearby jobs</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {searchSteps.map((step, index) => (
                  <div key={step} className="rounded-lg bg-slate-50 p-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="mt-4 text-sm font-semibold leading-6 text-slate-800">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
