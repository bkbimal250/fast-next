import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Reset Password',
  'Create a new password for your Workspa account.',
  {
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in'}/reset-password`,
    noindex: true,
  }
);

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
