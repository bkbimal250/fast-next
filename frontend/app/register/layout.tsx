import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Register - Create Account',
  'Create a free account on SPA Jobs to save job searches, track applications, and get personalized job recommendations.',
  {
    keywords: ['register', 'sign up', 'create account', 'spa jobs account'],
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://spajobs.com'}/register`,
  }
);

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

