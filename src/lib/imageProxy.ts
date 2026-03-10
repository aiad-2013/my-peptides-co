const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function getProxiedImageUrl(originalUrl: string): string {
  // Proxy images from vicorpus.co or vicorpus.com
  if (originalUrl && (originalUrl.includes('vicorpus.co') || originalUrl.includes('vicorpus.com'))) {
    return `${SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  return originalUrl;
}
