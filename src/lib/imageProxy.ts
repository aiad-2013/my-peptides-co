const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const PROXY_DOMAINS = ['vicorpus.co', 'vicorpus.com', 'checkout.mypeptideco.com'];

export function getProxiedImageUrl(originalUrl: string): string {
  if (originalUrl && PROXY_DOMAINS.some(d => originalUrl.includes(d))) {
    return `${SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  return originalUrl;
}

export function isProxiedUrl(url: string): boolean {
  return url.includes('/functions/v1/image-proxy');
}
