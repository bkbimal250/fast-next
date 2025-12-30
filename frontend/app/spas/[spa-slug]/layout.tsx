import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';

export async function generateMetadata({ params }: { params: { 'spa-slug': string } }): Promise<Metadata> {
  try {
    const slug = params['spa-slug'];
    
    // Fetch spa data
    const response = await fetch(`${API_URL}/api/spas/slug/${slug}`, {
      cache: 'no-store', // Always fetch fresh data for metadata
    });

    if (!response.ok) {
      return {
        title: 'SPA Not Found | SPA Jobs Portal',
        description: 'The SPA you are looking for does not exist.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const spa = await response.json();
    
    // Fetch location names
    let locationNames = {
      country: '',
      state: '',
      city: '',
      area: '',
    };

    try {
      const [countries, states, cities, areas] = await Promise.all([
        fetch(`${API_URL}/api/locations/countries`).then(r => r.ok ? r.json() : []),
        spa.state_id ? fetch(`${API_URL}/api/locations/states?country_id=${spa.country_id}`).then(r => r.ok ? r.json() : []) : Promise.resolve([]),
        spa.city_id ? fetch(`${API_URL}/api/locations/cities?state_id=${spa.state_id}`).then(r => r.ok ? r.json() : []) : Promise.resolve([]),
        spa.area_id ? fetch(`${API_URL}/api/locations/areas?city_id=${spa.city_id}`).then(r => r.ok ? r.json() : []) : Promise.resolve([]),
      ]);

      const country = countries.find((c: any) => c.id === spa.country_id);
      const state = states.find((s: any) => s.id === spa.state_id);
      const city = cities.find((c: any) => c.id === spa.city_id);
      const area = areas.find((a: any) => a.id === spa.area_id);

      locationNames = {
        country: country?.name || '',
        state: state?.name || '',
        city: city?.name || '',
        area: area?.name || '',
      };
    } catch (error) {
      console.error('Error fetching location names for metadata:', error);
    }

    const locationStr = [locationNames.area, locationNames.city, locationNames.state]
      .filter(Boolean)
      .join(', ');

    const title = `${spa.name}${locationStr ? ` - ${locationStr}` : ''} | SPA Jobs Portal`;
    const description = spa.description
      ? `${spa.description.substring(0, 155)}${spa.description.length > 155 ? '...' : ''}`
      : `${spa.name}${locationStr ? ` located in ${locationStr}` : ''}. Find spa jobs, contact information, and more.`;

    const canonical = `${SITE_URL}/spas/${spa.slug}`;
    const ogImage = spa.logo_image
      ? `${API_URL}${spa.logo_image.startsWith('/') ? spa.logo_image : `/${spa.logo_image}`}`
      : `${SITE_URL}/og-image-default.jpg`;

    return {
      title,
      description,
      keywords: [
        spa.name.toLowerCase(),
        `${spa.name} spa`,
        `spa ${locationNames.city || ''}`,
        `spa ${locationNames.area || ''}`,
        `spa jobs ${locationNames.city || ''}`,
        `${spa.name} jobs`,
        `${spa.name} contact`,
        `spa near me ${locationNames.city || ''}`,
      ].filter(Boolean),
      alternates: {
        canonical,
      },
      openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: canonical,
        siteName: 'Workspa - SPA Jobs Portal',
        title: `${spa.name}${locationStr ? ` - ${locationStr}` : ''}`,
        description,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${spa.name} - SPA Profile`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${spa.name}${locationStr ? ` - ${locationStr}` : ''}`,
        description,
        images: [ogImage],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error generating spa metadata:', error);
    return {
      title: 'SPA Profile | SPA Jobs Portal',
      description: 'View SPA profile and job openings.',
    };
  }
}

export default function SpaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
