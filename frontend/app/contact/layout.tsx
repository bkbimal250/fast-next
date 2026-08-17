import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Contact Us - Get in Touch | Workspa',
  'Contact Workspa for job seeker, recruiter, free listing, support, or feedback inquiries. Reach us by email, phone, or contact form.',
  {
    keywords: [
      'contact Workspa',
      'Workspa support',
      'contact workspa',
      'Workspa help',
      'spa job portal contact',
    ],
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in'}/contact`,
  }
);

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

