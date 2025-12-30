import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Apply for Job',
  'Apply for spa jobs directly. Submit your application with resume and cover letter.',
  {
    keywords: ['apply for job', 'job application', 'spa job application'],
    noindex: true, // Application forms should not be indexed
  }
);

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

