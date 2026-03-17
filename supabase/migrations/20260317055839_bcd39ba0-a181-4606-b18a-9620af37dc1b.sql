
CREATE TABLE public.cache_invalidations (
  id TEXT PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO public.cache_invalidations (id, updated_at) VALUES ('products', now());

ALTER TABLE public.cache_invalidations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cache invalidations"
  ON public.cache_invalidations FOR SELECT USING (true);

CREATE POLICY "Service role can update cache invalidations"
  ON public.cache_invalidations FOR UPDATE USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.cache_invalidations;
