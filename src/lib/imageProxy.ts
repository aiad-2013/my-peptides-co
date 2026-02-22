const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function getProxiedImageUrl(originalUrl: string): string {
  // Only proxy vicorpus.co images
  if (originalUrl && originalUrl.includes('vicorpus.co')) {
    return `${SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  return originalUrl;
}
