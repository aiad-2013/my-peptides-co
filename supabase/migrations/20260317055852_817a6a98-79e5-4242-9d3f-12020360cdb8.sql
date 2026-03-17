
-- Replace the overly permissive UPDATE policy with a service-role-only one
DROP POLICY "Service role can update cache invalidations" ON public.cache_invalidations;

-- Service role bypasses RLS entirely, so we restrict UPDATE to no one via RLS
-- (service role key used in edge functions will always bypass RLS)
CREATE POLICY "No direct client updates"
  ON public.cache_invalidations FOR UPDATE TO authenticated USING (false);
