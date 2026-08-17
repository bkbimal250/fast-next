import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Register - Create Account',
  'Create a free Workspa account to save job searches, track applications, and get personalized job recommendations.',
  {
    keywords: ['register', 'sign up', 'create account', 'Workspa account'],
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in'}/register`,
    noindex: true,
  }
);

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

