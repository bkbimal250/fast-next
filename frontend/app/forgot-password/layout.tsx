import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Forgot Password',
  'Reset access to your Workspa account.',
  {
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in'}/forgot-password`,
    noindex: true,
  }
);

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
