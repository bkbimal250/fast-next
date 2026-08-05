'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FaBriefcase,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaUser,
  FaUsers,
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { applicationAPI } from '@/lib/application';
import { showErrorToast, showToast } from '@/lib/toast';
import { capitalizeTitle } from '@/lib/text-utils';
import axios from 'axios';

interface JobCardProps {
  id: number;
  title: string;
  spa?: string;
  spaName?: string;
  spaAddress?: string;
  logoImage?: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceMin?: number;
  experienceMax?: number;
  jobOpeningCount?: number;
  jobType?: string;
  jobCategory?: string;
  slug: string;
  isFeatured?: boolean;
  viewCount?: number;
  created_at?: string;
  description?: string;
  postedBy?: {
    id?: number;
    name?: string;
    profile_photo?: string;
  };
  hr_contact_phone?: string;
  required_gender?: string;
  job_timing?: string;
  isNew?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function JobCard({
  id,
  title,
  spaName,
  logoImage,
  location,
  salaryMin,
  salaryMax,
  experienceMin,
  experienceMax,
  jobOpeningCount,
  jobType,
  jobCategory,
  slug,
  isFeatured,
  created_at,
  description,
  required_gender,
  job_timing,
  isNew = false,
}: JobCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [applying, setApplying] = useState(false);

  const logoUrl = logoImage
    ? `${API_URL}${logoImage.startsWith('/') ? logoImage : `/${logoImage}`}`
    : null;

  const getInitials = (name?: string) => {
    if (!name) return 'WS';
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatSalary = () => {
    const formatAmount = (amount: number) => {
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
      return `${Math.round(amount / 1000)}k`;
    };

    if (salaryMin && salaryMax) return `Rs ${formatAmount(salaryMin)} - ${formatAmount(salaryMax)} / month`;
    if (salaryMin) return `Rs ${formatAmount(salaryMin)}+ / month`;
    if (salaryMax) return `Up to Rs ${formatAmount(salaryMax)} / month`;
    return 'Salary not disclosed';
  };

  const formatExperience = () => {
    const hasMin = typeof experienceMin === 'number';
    const hasMax = typeof experienceMax === 'number';

    if (hasMin && hasMax) return `${experienceMin}-${experienceMax} yrs`;
    if (hasMin) return `${experienceMin}+ yrs`;
    if (hasMax) return `0-${experienceMax} yrs`;
    return 'Experience open';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (daysAgo <= 0) return 'Today';
    if (daysAgo === 1) return '1 day ago';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return `${Math.floor(daysAgo / 30)} months ago`;
  };

  const stripHtml = (value?: string) => {
    return (value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\*\*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const displayLocation = location && location !== 'Location not specified' ? location : 'Location not specified';
  const postedDate = formatDate(created_at);
  const cleanDescription = stripHtml(description);

  const handleApplyClick = async () => {
    axios.post(`${API_URL}/api/jobs/${id}/track-apply-click`).catch(() => {});

    if (!user) {
      router.push(`/apply/${slug}`);
      return;
    }

    setApplying(true);
    try {
      await applicationAPI.directApply(id);
      showToast.success('Application submitted successfully!');
      setTimeout(() => {
        router.push('/dashboard/applications');
      }, 1200);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to submit application. Please try again.';
      showErrorToast(err, errorMessage);
    } finally {
      setApplying(false);
    }
  };

  return (
    <article
      className={`group relative flex h-full flex-col rounded-lg border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg ${
        isNew ? 'border-green-400' : 'border-slate-200'
      }`}
    >
      <div className="mb-4 flex items-start gap-3">
        <Link
          href={`/jobs/${slug}`}
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-brand-50"
          aria-label={`View ${title}`}
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={spaName || 'Spa logo'}
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-700 text-sm font-bold text-white">
              {getInitials(spaName)}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap gap-1.5">
            {isFeatured && (
              <span className="rounded-full bg-gold-50 px-2 py-0.5 text-[11px] font-bold text-gold-800">
                Featured
              </span>
            )}
            {isNew && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
                New
              </span>
            )}
          </div>
          <Link href={`/jobs/${slug}`} className="block">
            <h3 className="line-clamp-2 min-h-[44px] text-base font-bold leading-snug text-slate-950 transition group-hover:text-brand-700">
              {capitalizeTitle(title)}
            </h3>
          </Link>
          <p className="mt-1 truncate text-sm font-medium text-slate-600">
            {capitalizeTitle(spaName || 'Workspa employer')}
          </p>
        </div>
      </div>

      <div className="grid gap-2 text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <FaRupeeSign className="shrink-0 text-gold-600" size={13} />
          <span className="font-semibold text-slate-950">{formatSalary()}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaBriefcase className="shrink-0 text-brand-600" size={13} />
          <span>{formatExperience()}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <FaMapMarkerAlt className="shrink-0 text-slate-500" size={13} />
          <span className="truncate" title={displayLocation}>
            {displayLocation}
          </span>
        </div>
        {jobOpeningCount !== undefined && jobOpeningCount > 0 && (
          <div className="flex items-center gap-2">
            <FaUsers className="shrink-0 text-brand-600" size={13} />
            <span>
              {jobOpeningCount} opening{jobOpeningCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {cleanDescription && (
        <p className="mt-3 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-600">
          {cleanDescription}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {jobCategory && (
          <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
            {jobCategory}
          </span>
        )}
        {jobType && (
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {jobType}
          </span>
        )}
      </div>

      <div className="mt-auto border-t border-slate-100 pt-4">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {required_gender && (
            <span className="flex items-center gap-1.5">
              <FaUser size={12} />
              {required_gender === 'Any' ? 'Any gender' : `${required_gender} only`}
            </span>
          )}
          {job_timing && (
            <span className="flex items-center gap-1.5">
              <FaClock size={12} />
              {job_timing}
            </span>
          )}
          {postedDate && (
            <span className="flex items-center gap-1.5">
              <FaCalendarAlt size={12} />
              {postedDate}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleApplyClick}
          disabled={applying}
          className="flex w-full items-center justify-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {applying ? 'Applying...' : 'Quick Apply'}
        </button>
      </div>
    </article>
  );
}
