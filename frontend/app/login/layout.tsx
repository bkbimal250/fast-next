import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Login - Sign In',
  'Sign in to your SPA Jobs account to access saved jobs, applications, and personalized features.',
  {
    keywords: ['login', 'sign in', 'spa jobs login'],
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://spajobs.com'}/login`,
  }
);

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

