import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

// This will be overridden by dynamic metadata in the page component
export const metadata: Metadata = generatePageMetadata(
  'SPA Job Details',
  'View detailed information about this spa job opportunity. See requirements, salary, location, and apply directly.',
  {
    keywords: ['spa job details', 'job description', 'spa job application'],
  }
);

export default function JobDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

