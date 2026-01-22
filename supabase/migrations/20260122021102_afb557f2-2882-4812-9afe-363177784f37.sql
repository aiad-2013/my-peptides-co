-- Add order_token column for secure order verification
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_token text;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_token ON public.orders(order_token);

-- Drop the existing permissive policy that uses email matching
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Keep the restrictive policy that blocks all direct access
-- The existing "Orders accessible via service role only" policy with USING(false) already blocks direct access

-- Add explicit RESTRICTIVE policies to block INSERT, UPDATE, DELETE from all users
-- (Service role bypasses RLS so webhooks will still work)
CREATE POLICY "No direct insert allowed"
ON public.orders
AS RESTRICTIVE
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "No direct update allowed"
ON public.orders
AS RESTRICTIVE
FOR UPDATE
TO authenticated, anon
USING (false)
WITH CHECK (false);

CREATE POLICY "No direct delete allowed"
ON public.orders
AS RESTRICTIVE
FOR DELETE
TO authenticated, anon
USING (false);