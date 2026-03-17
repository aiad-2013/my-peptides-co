import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

const DEFAULT_OG_IMAGE = 'https://lovable.dev/opengraph-image-p98pqg.png';

export const useSEO = ({ title, description, canonical, ogTitle, ogDescription, ogImage }: SEOProps) => {
  useEffect(() => {
    // Title
    document.title = title;

    // Helper to set/create meta tags
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', description);

    // OG tags
    const resolvedOgTitle = ogTitle || title;
    const resolvedOgDesc = ogDescription || description;
    const resolvedOgImage = ogImage || DEFAULT_OG_IMAGE;

    setMeta('meta[property="og:title"]', 'content', resolvedOgTitle);
    setMeta('meta[property="og:description"]', 'content', resolvedOgDesc);
    setMeta('meta[property="og:image"]', 'content', resolvedOgImage);

    setMeta('meta[name="twitter:title"]', 'content', resolvedOgTitle);
    setMeta('meta[name="twitter:description"]', 'content', resolvedOgDesc);
    setMeta('meta[name="twitter:image"]', 'content', resolvedOgImage);

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  }, [title, description, canonical, ogTitle, ogDescription, ogImage]);
};
