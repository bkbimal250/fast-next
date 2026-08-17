import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

// Default metadata for jobs listing page
// This can be overridden by child routes with generateMetadata
export const metadata: Metadata = generatePageMetadata(
  'Browse Spa Jobs',
  'Browse verified spa jobs across India. Filter by location, salary, experience, and job type to find therapist, receptionist, beautician, and spa manager openings.',
  {
    keywords: ['browse spa jobs', 'all spa jobs', 'spa job listings', 'spa job search'],
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in'}/jobs`,
  }
);

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

