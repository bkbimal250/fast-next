import type { Metadata } from 'next';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';

interface AreaLayoutProps {
  children: React.ReactNode;
  params: { city: string; area: string };
}

export async function generateMetadata({
  params,
}: {
  params: { city: string; area: string };
}): Promise<Metadata> {
  try {
    const cityName = params.city.replace(/-/g, ' ');
    const areaName = params.area.replace(/-/g, ' ');
    
    const capitalizedCity = cityName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const capitalizedArea = areaName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Fetch job count for this area
    let jobCount = 0;
    try {
      // First try to find area by slug to get area_id
      const areasResponse = await fetch(`${apiUrl}/api/locations/areas?limit=1000`, {
        cache: 'no-store',
      });
      
      let areaId: number | undefined;
      if (areasResponse.ok) {
        const areas = await areasResponse.json();
        const area = areas.find((a: any) => {
          const areaSlug = a.name.toLowerCase().replace(/\s+/g, '-');
          return areaSlug === params.area;
        });
        if (area) {
          areaId = area.id;
        }
      }
      
      // Build query params
      const params_query: any = {};
      if (areaId) {
        params_query.area_id = areaId;
      }
      
      // Fetch job count
      const countResponse = await fetch(`${apiUrl}/api/jobs/count?${new URLSearchParams(params_query as any).toString()}`, {
        cache: 'no-store',
      });
      
      if (countResponse.ok) {
        const data = await countResponse.json();
        jobCount = data.count || 0;
      }
    } catch (error) {
      console.error('Error fetching job count:', error);
    }

    const jobCountText = jobCount > 0 ? `${jobCount.toLocaleString()} ` : '';
    const baseTitle = `SPA Jobs in ${capitalizedArea}, ${capitalizedCity}`;
    const fullTitle = jobCount > 0 
      ? `${baseTitle} - ${jobCountText}Jobs Available | SPA Jobs Portal`
      : `${baseTitle} | SPA Jobs Portal`;
    
    const description = `Find ${jobCountText}spa jobs in ${capitalizedArea}, ${capitalizedCity}. Browse and apply to spa job vacancies in ${capitalizedArea}. Search spa jobs near you with salary, experience, and location filters.`;
    
    const pageUrl = `${siteUrl}/cities/${params.city}/${params.area}`;
    
    return {
      title: fullTitle,
      description,
      keywords: [
        `spa jobs ${capitalizedArea}`,
        `spa jobs in ${capitalizedArea}`,
        `spa jobs ${capitalizedArea} ${capitalizedCity}`,
        `spa jobs in ${capitalizedArea} ${capitalizedCity}`,
        `jobs in ${capitalizedArea}`,
        `${capitalizedArea} spa jobs`,
        capitalizedArea,
        capitalizedCity,
      ],
      openGraph: {
        type: 'website',
        url: pageUrl,
        title: fullTitle,
        description,
        siteName: 'Workspa - SPA Jobs Portal',
      },
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description,
      },
      alternates: {
        canonical: pageUrl,
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
    console.error('Error generating area metadata:', error);
    // Fallback metadata
    const cityName = params.city.replace(/-/g, ' ');
    const areaName = params.area.replace(/-/g, ' ');
    const capitalizedCity = cityName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    const capitalizedArea = areaName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      title: `SPA Jobs in ${capitalizedArea}, ${capitalizedCity} | SPA Jobs Portal`,
      description: `Find spa jobs in ${capitalizedArea}, ${capitalizedCity}. Browse and apply to spa job vacancies.`,
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

export default function AreaLayout({
  children,
}: AreaLayoutProps) {
  return <>{children}</>;
}

