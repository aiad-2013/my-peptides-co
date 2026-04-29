-- Products cache table
CREATE TABLE public.products_cache (
  slug TEXT PRIMARY KEY,
  woocommerce_id BIGINT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  image_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_cache_woocommerce_id ON public.products_cache(woocommerce_id);
CREATE INDEX idx_products_cache_synced_at ON public.products_cache(synced_at);

ALTER TABLE public.products_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached products"
  ON public.products_cache FOR SELECT
  USING (true);

CREATE POLICY "No direct client inserts"
  ON public.products_cache FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct client updates"
  ON public.products_cache FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No direct client deletes"
  ON public.products_cache FOR DELETE
  TO authenticated
  USING (false);

-- Public storage bucket for mirrored product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access to product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Enable required extensions for scheduled sync
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;