import type { Metadata } from 'next';
import { parseLocationSlugSmart } from '@/lib/location-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';

export async function generateMetadata({
  params
}: {
  params: { city: string }
}): Promise<Metadata> {
  try {
    const parsed = await parseLocationSlugSmart(params.city);
    const cityName = parsed.city || params.city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Fetch job count for metadata
    let jobCount = 0;
    try {
      const response = await fetch(`${API_URL}/api/jobs/count?city_id=${parsed.cityId || ''}`, {
        next: { revalidate: 3600 }
      });
      if (response.ok) {
        const data = await response.json();
        jobCount = data.count || 0;
      }
    } catch (e) { }

    const title = `Spa Jobs in ${cityName} - Find ${jobCount > 0 ? jobCount : ''} Jobs | Workspa`;
    const description = `Find the latest spa therapist, receptionist, and spa manager jobs in ${cityName} on Workspa.in. ${jobCount > 0 ? `We have ${jobCount} active openings.` : 'Browse openings and apply directly.'}`;
    const pageUrl = `${SITE_URL}/cities/${params.city}`;

    return {
      title,
      description,
      alternates: { canonical: pageUrl },
      openGraph: {
        title,
        description,
        url: pageUrl,
        type: 'website',
      },
    };
  } catch (error) {
    return { title: 'Spa Jobs | Workspa' };
  }
}

export default function CityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
