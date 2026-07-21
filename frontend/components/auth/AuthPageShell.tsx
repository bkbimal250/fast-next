'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthPageShell({ title, subtitle, children, footer }: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-surface-light">
      <Navbar />
      <main className="page-shell flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center">
            <Link href="/" className="inline-flex text-3xl font-bold text-brand-700">
              Workspa
            </Link>
            <h1 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-gray-600">{subtitle}</p>
          </div>

          <div className="card p-6 sm:p-7">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-gray-600">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
