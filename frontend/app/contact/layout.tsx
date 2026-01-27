import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Contact Us - Get in Touch | Work Spa Portal',
  'Contact Work Spa Portal for inquiries, support, or feedback. Reach us via email, phone, or contact form. We typically respond within 24-48 hours.',
  {
    keywords: [
      'contact Work Spa',
      'Work Spa support',
      'contact workspa',
      'Work Spa help',
      'job portal contact',
    ],
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in' || 'https://spatherapist.workspa.in' || 'https://therapist.workspa.in' || 'https://spamanagerjobs.workspa.in' || 'https://spajob.api.spajob.spajobs.co.in'}/contact`,
  }
);

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

