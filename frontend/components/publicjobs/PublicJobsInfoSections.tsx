'use client';

import Link from 'next/link';
import { FaCheckCircle, FaMapMarkedAlt, FaRupeeSign, FaUserShield } from 'react-icons/fa';

type PublicJobsInfoSectionsProps = {
  locationLabel?: string;
};

const roles = [
  'Spa Therapist',
  'Receptionist',
  'Spa Manager',
  'Beautician',
  'Housekeeping',
  'Massage Therapist',
];

export default function PublicJobsInfoSections({ locationLabel }: PublicJobsInfoSectionsProps) {
  const place = locationLabel || 'your preferred city';

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Find spa jobs in {place}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Compare nearby spa roles by salary, experience, timing, openings, and employer location. Workspa is designed for fast scanning, quick shortlisting, and direct applications.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-brand-50 p-4">
            <FaMapMarkedAlt className="text-brand-700" size={20} />
            <h3 className="mt-3 font-bold text-slate-950">Location first</h3>
            <p className="mt-1 text-sm text-slate-600">Search by city, area, or nearby roles.</p>
          </div>
          <div className="rounded-lg bg-gold-50 p-4">
            <FaRupeeSign className="text-gold-700" size={20} />
            <h3 className="mt-3 font-bold text-slate-950">Salary clarity</h3>
            <p className="mt-1 text-sm text-slate-600">Check pay ranges before applying.</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <FaUserShield className="text-slate-700" size={20} />
            <h3 className="mt-3 font-bold text-slate-950">Candidate safety</h3>
            <p className="mt-1 text-sm text-slate-600">Avoid unclear offers and verify details.</p>
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Popular roles</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {roles.map((role) => (
            <Link
              key={role}
              href={`/jobs?q=${encodeURIComponent(role)}`}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {role}
            </Link>
          ))}
        </div>
        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <p className="flex gap-2">
            <FaCheckCircle className="mt-0.5 shrink-0 text-brand-700" />
            Never pay money for a job interview.
          </p>
          <p className="flex gap-2">
            <FaCheckCircle className="mt-0.5 shrink-0 text-brand-700" />
            Meet only at the official business address.
          </p>
        </div>
      </aside>
    </div>
  );
}
