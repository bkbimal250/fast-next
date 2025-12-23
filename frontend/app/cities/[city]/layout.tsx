import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const cityName = params.city.replace(/-/g, ' ');
  const capitalizedCity = cityName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return generatePageMetadata(
    `SPA Jobs in ${capitalizedCity}`,
    `Find spa jobs in ${capitalizedCity}. Browse therapist, masseuse, and spa manager positions. Apply directly without login.`,
    {
      keywords: [
        `spa jobs ${capitalizedCity}`,
        `spa jobs in ${capitalizedCity}`,
        `${capitalizedCity} spa jobs`,
        `spa careers ${capitalizedCity}`,
      ],
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in'}/cities/${params.city}`,
    }
  );
}

export default function CityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

