import blogFallback from '@/assets/blog-fallback.jpg';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Origins whose images we can still reach via the image-proxy edge function.
// vicorpus.com / vicorpus.co are legacy hosts that no longer serve uploads
// (they return a 200 HTML page or 404), so we fall back when we see them.
const PROXY_DOMAINS = ['checkout.mypeptideco.com'];
const BROKEN_DOMAINS = ['vicorpus.com', 'vicorpus.co'];

export const BLOG_FALLBACK_IMAGE = blogFallback;

export function getProxiedImageUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;
  if (PROXY_DOMAINS.some(d => originalUrl.includes(d))) {
    return `${SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  return originalUrl;
}

export function getBlogImageUrl(originalUrl: string | null | undefined): string {
  if (!originalUrl) return blogFallback;
  if (BROKEN_DOMAINS.some(d => originalUrl.includes(d))) return blogFallback;
  return getProxiedImageUrl(originalUrl);
}

export function isProxiedUrl(url: string): boolean {
  return url.includes('/functions/v1/image-proxy');
}

