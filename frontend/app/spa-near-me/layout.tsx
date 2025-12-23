import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata(
  'SPAs Near Me - Find Nearby Spas',
  'Discover spas and wellness centers near you. Find the best spas in your area with location-based search. View spa profiles, ratings, and available job openings.',
  {
    keywords: ['spas near me', 'nearby spas', 'local spas', 'spa finder', 'wellness centers near me'],
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in'}/spa-near-me`,
  }
);

export default function SpaNearMeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

