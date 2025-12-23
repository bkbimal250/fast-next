import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Unsubscribe from Job Alerts',
  'Unsubscribe from SPA Jobs email notifications and job alerts.',
  {
    keywords: ['unsubscribe', 'email preferences'],
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in'}/unsubscribe`,
    noindex: true, // Unsubscribe pages should not be indexed
  }
);

export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

