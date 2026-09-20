import { useEffect } from 'react';

/**
 * Lightweight SEO & Meta tag manager for React applications
 * Dynamically synchronizes document title and essential Open Graph meta tags
 * without requiring external bulky dependencies.
 *
 * @param {object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description
 * @param {string} [props.canonical] - Canonical URL
 * @param {string} [props.ogType='website'] - OpenGraph type
 * @param {string} [props.image] - OpenGraph share image URL
 */
export default function SEO({
  title = 'VIRAT TOM | Static and Dynamic Website Development',
  description = 'Ultra-minimalist, high-performance web agency engineering bespoke landing pages and dynamic MERN full-stack applications.',
  canonical,
  ogType = 'website',
  image = '/favicon.svg',
}) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title;
    }

    // 2. Helper to create or update meta tags
    const setMetaTag = (selector, attributeName, attributeValue, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Update Standard Meta
    if (description) {
      setMetaTag('meta[name="description"]', 'name', 'description', description);
    }

    // 4. Update OpenGraph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    if (image) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
    }

    // 5. Update Twitter Cards
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    // 6. Update Canonical Link
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
    }
  }, [title, description, canonical, ogType, image]);

  return null;
}
