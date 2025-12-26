import { useEffect } from 'react';
import { Spa } from '@/lib/spa';
import { Job } from '@/lib/job';

interface Metadata {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  schema: object;
}

interface LocationNames {
  country?: string;
  state?: string;
  city?: string;
  area?: string;
}

export function useSpaSEO(
  spa: Spa | null,
  jobs: Job[],
  locationNames: LocationNames,
  metadata: Metadata | null
) {
  useEffect(() => {
    if (!metadata) return;

    // Update title
    document.title = metadata.title;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update description
    updateMetaTag('description', metadata.description);

    // Update Open Graph tags
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:url', metadata.ogUrl, 'property');
    updateMetaTag('og:title', metadata.ogTitle, 'property');
    updateMetaTag('og:description', metadata.ogDescription, 'property');
    updateMetaTag('og:image', metadata.ogImage, 'property');

    // Update Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', 'property');
    updateMetaTag('twitter:url', metadata.ogUrl, 'property');
    updateMetaTag('twitter:title', metadata.ogTitle, 'property');
    updateMetaTag('twitter:description', metadata.ogDescription, 'property');
    updateMetaTag('twitter:image', metadata.ogImage, 'property');

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', metadata.canonical);

    // Add structured data
    let schemaScript = document.querySelector('script[type="application/ld+json"][data-spa-schema]');
    if (schemaScript) {
      schemaScript.textContent = JSON.stringify(metadata.schema);
    } else {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.setAttribute('data-spa-schema', 'true');
      schemaScript.textContent = JSON.stringify(metadata.schema);
      document.head.appendChild(schemaScript);
    }
  }, [metadata]);
}

export function generateSpaMetadata(
  spa: Spa,
  jobs: Job[],
  locationNames: LocationNames
): Metadata {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const canonical = `${baseUrl}/spas/${spa.slug}`;
  const locationStrForTitle = [locationNames.area, locationNames.city, locationNames.state]
    .filter(Boolean)
    .join(', ');

  const locationDisplay = locationStrForTitle || spa.address || '';

  const description = spa.description
    ? `${spa.description.substring(0, 155)}${spa.description.length > 155 ? '...' : ''}`
    : `${spa.name}${locationDisplay ? ` located in ${locationDisplay}` : ''}. ${jobs.length > 0 ? `We have ${jobs.length} job opening${jobs.length > 1 ? 's' : ''} available.` : ''} Contact us for more information.`;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';
  const ogImage = spa.logo_image
    ? `${apiUrl}/${spa.logo_image}`
    : `${baseUrl}/og-image-default.jpg`;

  // Structured Data (JSON-LD) for SPA - Using both LocalBusiness and HealthAndBeautyBusiness for better SEO
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HealthAndBeautyBusiness'],
    name: spa.name,
    description: spa.description || `${spa.name} - Professional SPA Services`,
    url: spa.website || canonical,
    image: spa.logo_image
      ? `${apiUrl}/${spa.logo_image}`
      : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: spa.address || '',
      addressLocality: locationNames.city || '',
      addressRegion: locationNames.state || '',
      addressCountry: locationNames.country || 'IN',
    },
    telephone: spa.phone || '',
    email: spa.email || '',
    openingHours:
      spa.opening_hours && spa.closing_hours
        ? `Mo-Su ${spa.opening_hours}-${spa.closing_hours}`
        : undefined,
    priceRange: '$$',
    // Only include ratings if verified (to avoid fake reviews in schema)
    ...(spa.is_verified && spa.rating && spa.reviews && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: spa.rating,
        reviewCount: spa.reviews,
      }
    }),
    ...(jobs.length > 0 && {
      jobPosting: jobs.map((job) => ({
        '@type': 'JobPosting',
        title: job.title,
        description: job.description?.substring(0, 500),
        datePosted: job.created_at,
        validThrough: job.expires_at,
        employmentType: job.Employee_type || 'FULL_TIME',
        baseSalary:
          job.salary_min && job.salary_max
            ? {
                '@type': 'MonetaryAmount',
                currency: job.salary_currency || 'INR',
                value: {
                  '@type': 'QuantitativeValue',
                  minValue: job.salary_min,
                  maxValue: job.salary_max,
                  unitText: 'MONTH',
                },
              }
            : undefined,
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: job.city?.name || locationNames.city || '',
            addressRegion: job.state?.name || locationNames.state || '',
            addressCountry: job.country?.name || locationNames.country || 'IN',
          },
        },
      })),
    }),
  };

  return {
    title: `${spa.name}${locationStrForTitle ? ` - ${locationStrForTitle}` : ''} | SPA Jobs Portal`,
    description,
    canonical,
    ogTitle: `${spa.name}${locationStrForTitle ? ` - ${locationStrForTitle}` : ''}`,
    ogDescription: description,
    ogImage,
    ogUrl: canonical,
    schema,
  };
}

