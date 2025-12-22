import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Dashboard',
  'Manage your SPA Jobs dashboard. View analytics, manage jobs, applications, and more.',
  {
    keywords: ['dashboard', 'admin dashboard', 'spa jobs dashboard'],
    noindex: true, // Dashboard pages should not be indexed
  }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

