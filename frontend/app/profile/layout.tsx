import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'My Profile',
  'Manage your SPA Jobs profile, view saved jobs, track applications, and update your preferences.',
  {
    keywords: ['profile', 'my account', 'user profile'],
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://spajobs.com'}/profile`,
    noindex: true, // Profile pages should not be indexed
  }
);

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

