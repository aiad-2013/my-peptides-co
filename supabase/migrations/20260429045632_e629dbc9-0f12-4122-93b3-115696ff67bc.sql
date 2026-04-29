-- Replace permissive `false` policies with policies that match nothing
DROP POLICY IF EXISTS "No client inserts" ON public.user_roles;
DROP POLICY IF EXISTS "No client updates" ON public.user_roles;
DROP POLICY IF EXISTS "No client deletes" ON public.user_roles;

-- Lock down has_role: only authenticated callers + service role
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;