'use client';

import Link from 'next/link';
import { FaBriefcase, FaMapMarkerAlt, FaSearch, FaShieldAlt } from 'react-icons/fa';

type PublicJobsHeroProps = {
  title: string;
  subtitle: string;
  locationLabel?: string;
  jobCount?: number;
  primaryHref?: string;
  primaryLabel?: string;
};

export default function PublicJobsHero({
  title,
  subtitle,
  locationLabel,
  jobCount,
  primaryHref = '/jobs',
  primaryLabel = 'Browse jobs',
}: PublicJobsHeroProps) {
  return (
    <section className="border-b border-brand-900 bg-brand-800 text-white">
      <div className="page-shell py-8 sm:py-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                <FaShieldAlt size={13} />
                Verified spa opportunities
              </span>
              {locationLabel && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                  <FaMapMarkerAlt size={13} />
                  {locationLabel}
                </span>
              )}
            </div>
            <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
              {subtitle}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={primaryHref} className="btn-primary">
                <FaSearch size={14} />
                {primaryLabel}
              </Link>
              <Link href="/free-listing" className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Free listing
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-white/10 p-4">
            <div className="rounded-lg bg-white p-4 text-brand-900">
              <FaBriefcase className="mb-3 text-brand-700" size={20} />
              <p className="text-2xl font-bold">{jobCount && jobCount > 0 ? jobCount : 'Fresh'}</p>
              <p className="mt-1 text-sm text-slate-600">matching jobs</p>
            </div>
            <div className="rounded-lg bg-white p-4 text-brand-900">
              <FaMapMarkerAlt className="mb-3 text-brand-700" size={20} />
              <p className="text-2xl font-bold">Local</p>
              <p className="mt-1 text-sm text-slate-600">city and area filters</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
