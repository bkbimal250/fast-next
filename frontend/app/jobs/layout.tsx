import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Browse All SPA Jobs',
  'Browse thousands of spa jobs across India. Filter by location, salary, experience, and job type. Find therapist, masseuse, and spa manager positions.',
  {
    keywords: ['browse spa jobs', 'all spa jobs', 'spa job listings', 'spa job search'],
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://spajobs.com'}/jobs`,
  }
);

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

