'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  FaBriefcase,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRupeeSign,
  FaUser,
  FaUsers,
  FaWhatsapp,
} from 'react-icons/fa';
import { Job } from '@/lib/job';
import { capitalizeTitle } from '@/lib/text-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type PublicJobCardProps = {
  job: Job;
};

function formatSalary(job: Job) {
  const formatAmount = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    return `${Math.round(amount / 1000)}k`;
  };

  if (job.salary_min && job.salary_max) {
    return `${formatAmount(job.salary_min)} - ${formatAmount(job.salary_max)} / month`;
  }

  if (job.salary_min) return `${formatAmount(job.salary_min)}+ / month`;
  if (job.salary_max) return `Up to ${formatAmount(job.salary_max)} / month`;
  return 'Salary not disclosed';
}

function formatExperience(job: Job) {
  const hasMin = typeof job.experience_years_min === 'number';
  const hasMax = typeof job.experience_years_max === 'number';

  if (hasMin && hasMax) {
    return `${job.experience_years_min}-${job.experience_years_max} yrs`;
  }

  if (hasMin) return `${job.experience_years_min}+ yrs`;
  if (hasMax) return `0-${job.experience_years_max} yrs`;
  return 'Experience open';
}

function formatDate(dateString?: string) {
  if (!dateString) return null;

  const date = new Date(dateString);
  const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (daysAgo <= 0) return 'Today';
  if (daysAgo === 1) return '1 day ago';
  if (daysAgo < 7) return `${daysAgo} days ago`;
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
  return `${Math.floor(daysAgo / 30)} months ago`;
}

function getLocation(job: Job) {
  return [job.area?.name, job.city?.name].filter(Boolean).join(', ') || 'Location not specified';
}

function getLogoUrl(job: Job) {
  const logo = job.spa?.logo_image;
  if (!logo) return null;
  if (logo.startsWith('http')) return logo;
  return `${API_URL}${logo.startsWith('/') ? logo : `/${logo}`}`;
}

function getInitials(name?: string) {
  if (!name) return 'WS';
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function stripHtml(value?: string) {
  return (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function PublicJobCard({ job }: PublicJobCardProps) {
  const router = useRouter();
  const logoUrl = getLogoUrl(job);
  const postedDate = formatDate(job.created_at);
  const description = stripHtml(job.description);
  const contactPhone = job.hr_contact_phone?.replace(/[^\d+]/g, '') || '';
  const callHref = contactPhone ? `tel:${contactPhone}` : undefined;
  const whatsappPhone = contactPhone
    ? contactPhone.startsWith('+')
      ? contactPhone.replace(/[^\d]/g, '')
      : `91${contactPhone.replace(/^0+/, '')}`
    : '';
  const whatsappMessage = encodeURIComponent(
    `Hi, I am interested in the ${capitalizeTitle(job.title)} job${job.spa?.name ? ` at ${capitalizeTitle(job.spa.name)}` : ''}.`
  );
  const whatsappHref = whatsappPhone ? `https://wa.me/${whatsappPhone}?text=${whatsappMessage}` : undefined;

  const handleCardClick = () => {
    router.push(`/jobs/${job.slug}`);
  };

  return (
    <article
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCardClick();
        }
      }}
      className="group flex h-full cursor-pointer flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
    >
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-brand-50">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={job.spa?.name || 'Spa logo'}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-700 text-sm font-bold text-white">
              {getInitials(job.spa?.name)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            {job.is_featured && (
              <span className="rounded-full bg-gold-50 px-2 py-0.5 text-[11px] font-semibold text-gold-800">
                Featured
              </span>
            )}
            {postedDate && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <FaCalendarAlt size={10} />
                {postedDate}
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 min-h-[44px] text-base font-bold leading-snug text-slate-950 group-hover:text-brand-700">
            {capitalizeTitle(job.title)}
          </h3>
          <p className="mt-1 truncate text-sm font-medium text-slate-600">
            {capitalizeTitle(job.spa?.name || 'Workspa employer')}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-700">
        <div className="flex min-w-0 items-center gap-2">
          <FaMapMarkerAlt className="shrink-0 text-brand-600" size={13} />
          <span className="truncate">{getLocation(job)}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaRupeeSign className="shrink-0 text-gold-600" size={13} />
          <span className="font-semibold text-slate-900">{formatSalary(job)}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaBriefcase className="shrink-0 text-brand-600" size={13} />
          <span>{formatExperience(job)}</span>
        </div>
      </div>

      {description && (
        <p className="mt-3 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-600">
          {description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.job_category?.name && (
          <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
            {job.job_category.name}
          </span>
        )}
        {job.job_type?.name && (
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {job.job_type.name}
          </span>
        )}
      </div>

      <div className="mt-auto border-t border-slate-100 pt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <FaUsers size={12} />
            {job.job_opening_count || 1} opening{(job.job_opening_count || 1) > 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5">
            {job.job_timing ? <FaClock size={12} /> : <FaUser size={12} />}
            {job.job_timing || job.required_gender || 'Contact employer'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {callHref ? (
            <a
              href={callHref}
              onClick={(event) => event.stopPropagation()}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              <FaPhoneAlt size={13} />
              Call
            </a>
          ) : (
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              disabled
              className="flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-400"
            >
              <FaPhoneAlt size={13} />
              Call
            </button>
          )}

          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
            >
              <FaWhatsapp size={15} />
              WhatsApp
            </a>
          ) : (
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              disabled
              className="flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-400"
            >
              <FaWhatsapp size={15} />
              WhatsApp
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
