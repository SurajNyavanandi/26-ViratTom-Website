import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = 'ViratTom Technologies | Custom Web & Mobile App Development Company | Free ATS Resume Builder';
const DEFAULT_DESCRIPTION = 'ViratTom Technologies is an IT software engineering company delivering high-performance web applications, scalable mobile apps (iOS & Android), custom SaaS solutions, and free developer tools.';
const DEFAULT_KEYWORDS = 'IT Software Company, Custom Software Development Company, Web Application Development, Mobile App Development Services, React Node.js Agency, Full Stack Developers India, Free ATS Resume Builder, Developer CV Maker Online, ViratTom Technologies, Enterprise Software Solutions';
const SITE_URL = (typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://virattom.com').replace(/\/+$/, '');
const DEFAULT_OG_IMAGE = `${SITE_URL}/projects/inisio.png`;

export const SEO: React.FC<SEOProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  jsonLd,
}) => {
  const location = useLocation();

  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to safely set or create meta tag
    const setMetaTag = (attribute: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'author', 'ViratTom Technologies');
    setMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // 3. Canonical Link
    const targetCanonical = canonical || `${SITE_URL}${location.pathname === '/' ? '/' : location.pathname}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', targetCanonical);

    // 4. OpenGraph Tags
    setMetaTag('property', 'og:site_name', 'ViratTom Technologies');
    setMetaTag('property', 'og:locale', 'en_US');
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', targetCanonical);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:image:alt', title);

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);
    setMetaTag('name', 'twitter:creator', '@virattom');

    // 6. JSON-LD Structured Data
    const scriptId = 'dynamic-jsonld-schema';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, keywords, canonical, ogType, ogImage, jsonLd, location.pathname]);

  return null;
};
