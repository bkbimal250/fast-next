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
    `Work Spa in ${capitalizedCity}`,
    `Find Work Spa in ${capitalizedCity}. Browse therapist, masseuse, and spa manager positions. Apply directly without login.`,
    {
      keywords: [
        `Work Spa ${capitalizedCity}`,
        `Work Spa in ${capitalizedCity}`,
        `${capitalizedCity} Work Spa`,
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

