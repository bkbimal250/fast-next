import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: { location?: string[] | string };
}): Promise<Metadata> {
  // Handle catch-all route: location is an array
  const locationArray = Array.isArray(params.location) ? params.location : (params.location ? [params.location] : []);
  const locationSlug = locationArray.join('-');
  
  if (!locationSlug) {
    return {
      title: 'SPA Jobs | Find Spa Jobs',
      description: 'Find spa jobs. Browse therapist, masseuse, and spa manager positions.',
    };
  }
  
  // Format location name from slug
  const locationName = locationSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const title = `SPA Jobs in ${locationName} | Find Spa Jobs`;
  const description = `Find spa jobs in ${locationName}. Browse therapist, masseuse, and spa manager positions. Apply directly without login.`;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';
  const pageUrl = `${siteUrl}/spa-jobs-in-${locationSlug}`;
  
  return generatePageMetadata(title, description, {
    keywords: [
      `spa jobs ${locationName}`,
      `spa jobs in ${locationName}`,
      `${locationName} spa jobs`,
      'spa therapist jobs',
      'massage therapist jobs',
    ],
    url: pageUrl,
  });
}

export default function LocationJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

