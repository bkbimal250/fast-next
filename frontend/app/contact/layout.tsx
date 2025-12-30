import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'Contact Us - Get in Touch | SPA Jobs Portal',
  'Contact SPA Jobs Portal for inquiries, support, or feedback. Reach us via email, phone, or contact form. We typically respond within 24-48 hours.',
  {
    keywords: [
      'contact spa jobs',
      'spa jobs support',
      'contact workspa',
      'spa jobs help',
      'job portal contact',
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

