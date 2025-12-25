import type { Metadata } from 'next';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspa.in';

interface CategoryLocationLayoutProps {
  children: React.ReactNode;
  params: { category: string; location: string };
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; location: string };
}): Promise<Metadata> {
  try {
    const categorySlug = params.category;
    const locationSlug = params.location;
    
    // Format category name (capitalize each word)
    const categoryName = categorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Format location name (capitalize each word)
    const locationName = locationSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Fetch job count for this category and location
    let jobCount = 0;
    try {
      // First try to find city by slug to get city_id
      const citiesResponse = await fetch(`${apiUrl}/api/locations/cities?limit=1000`, {
        cache: 'no-store',
      });
      
      let cityId: number | undefined;
      if (citiesResponse.ok) {
        const cities = await citiesResponse.json();
        const city = cities.find((c: any) => c.slug === locationSlug);
        if (city) {
          cityId = city.id;
        }
      }
      
      // Build query params
      const params_query: any = {
        job_category: categorySlug,
      };
      
      if (cityId) {
        params_query.city_id = cityId;
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
    
    // Format title like: "Therapist Jobs In Navi Mumbai - 1525 Therapist Job Vacancies In Navi Mumbai"
    // For browser tab: Keep it shorter "Therapist Jobs In Navi Mumbai"
    // For full SEO title: Include count "Therapist Jobs In Navi Mumbai - 1525 Therapist Job Vacancies In Navi Mumbai"
    const jobCountText = jobCount > 0 ? `${jobCount.toLocaleString()} ` : '';
    const baseTitle = `${categoryName} Jobs In ${locationName}`;
    const fullTitle = jobCount > 0 
      ? `${baseTitle} - ${jobCountText}${categoryName} Job Vacancies In ${locationName} | SPA Jobs Portal`
      : `${baseTitle} | SPA Jobs Portal`;
    
    // Use full title for SEO (search engines will show what they want)
    const title = fullTitle;
    
    const description = `Find ${jobCountText}${categoryName.toLowerCase()} jobs in ${locationName}. Browse and apply to ${categoryName.toLowerCase()} job vacancies in ${locationName}. Search ${categoryName.toLowerCase()} jobs near you with salary, experience, and location filters.`;
    
    const pageUrl = `${siteUrl}/jobs/category/${categorySlug}/location/${locationSlug}`;
    
    return {
      title,
      description,
      keywords: [
        `${categoryName} jobs`,
        `${categoryName} jobs in ${locationName}`,
        `${categoryName} job vacancies in ${locationName}`,
        `spa jobs ${locationName}`,
        `${categoryName.toLowerCase()} jobs near me`,
        `jobs in ${locationName}`,
        locationName,
        categoryName,
      ],
      openGraph: {
        type: 'website',
        url: pageUrl,
        title,
        description,
        siteName: 'Workspa - SPA Jobs Portal',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      alternates: {
        canonical: pageUrl,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    // Fallback metadata
    const categoryName = params.category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    const locationName = params.location
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      title: `${categoryName} Jobs In ${locationName} | SPA Jobs Portal`,
      description: `Find ${categoryName.toLowerCase()} jobs in ${locationName}. Browse and apply to spa job vacancies.`,
    };
  }
}

export default function CategoryLocationLayout({
  children,
}: CategoryLocationLayoutProps) {
  return <>{children}</>;
}

