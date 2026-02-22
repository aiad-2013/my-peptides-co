import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
      return new Response('Missing url parameter', { status: 400, headers: corsHeaders });
    }

    // Only allow proxying images from vicorpus.co
    const parsedUrl = new URL(imageUrl);
    if (!parsedUrl.hostname.endsWith('vicorpus.co')) {
      return new Response('Only vicorpus.co images allowed', { status: 403, headers: corsHeaders });
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*',
        'Referer': 'https://vicorpus.co/',
      },
    });

    if (!response.ok) {
      return new Response(`Image fetch failed: ${response.status}`, { 
        status: response.status, 
        headers: corsHeaders 
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageData = await response.arrayBuffer();

    return new Response(imageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new Response('Proxy error', { status: 500, headers: corsHeaders });
  }
});
