'use client';

import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  url?: string;
  image?: string;
  noindex?: boolean;
}

/**
 * Client component to dynamically update page metadata
 * Use this for client components that need dynamic SEO
 */
export default function SEOHead({
  title,
  description,
  keywords,
  url,
  image,
  noindex = false,
}: SEOHeadProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spajobs.com';
  const siteName = 'SPA Jobs Portal';
  const pageTitle = title ? `${title} | ${siteName}` : `${siteName}`;
  const pageDescription = description || 'Find the best spa jobs near you. Apply directly to spas without login.';
  const pageUrl = url || siteUrl;
  const pageImage = image || `${siteUrl}/og-image.jpg`;
  const keywordsString = keywords?.join(', ') || 'spa jobs, spa therapist jobs, massage therapist jobs';

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = pageTitle;
    }

    // Update meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update description
    updateMetaTag('description', pageDescription);
    updateMetaTag('keywords', keywordsString);

    // Update Open Graph tags
    updateMetaTag('og:title', pageTitle, 'property');
    updateMetaTag('og:description', pageDescription, 'property');
    updateMetaTag('og:url', pageUrl, 'property');
    updateMetaTag('og:image', pageImage, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:site_name', siteName, 'property');

    // Update Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', pageTitle, 'name');
    updateMetaTag('twitter:description', pageDescription, 'name');
    updateMetaTag('twitter:image', pageImage, 'name');

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', pageUrl);

    // Update robots
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }
  }, [title, description, keywords, url, image, noindex, pageTitle, pageDescription, pageUrl, pageImage, keywordsString, siteName]);

  return null; // This component doesn't render anything
}

