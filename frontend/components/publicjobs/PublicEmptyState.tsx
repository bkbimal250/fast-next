'use client';

import Link from 'next/link';
import { FaBriefcase } from 'react-icons/fa';

type PublicEmptyStateProps = {
  title: string;
  description: string;
};

export default function PublicEmptyState({ title, description }: PublicEmptyStateProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <FaBriefcase size={24} />
      </div>
      <h2 className="mt-4 text-xl font-bold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link href="/jobs" className="btn-primary">
          Browse all jobs
        </Link>
        <Link href="/blog" className="btn-secondary">
          Career guides
        </Link>
      </div>
    </div>
  );
}
