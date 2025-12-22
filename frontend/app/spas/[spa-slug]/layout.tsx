import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

// This will be overridden by dynamic metadata in the page component
export const metadata: Metadata = generatePageMetadata(
  'SPA Profile',
  'View detailed SPA profile, photos, contact information, and available job openings.',
  {
    keywords: ['spa profile', 'spa details', 'spa information'],
  }
);

export default function SpaDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

