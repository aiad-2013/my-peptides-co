-- Drop the insecure public policy
DROP POLICY IF EXISTS "Orders are viewable by order reference" ON public.orders;

-- Create a restrictive policy - only service role can access directly
-- Frontend will use an edge function to fetch order details securely
CREATE POLICY "Orders accessible via service role only"
ON public.orders
FOR SELECT
USING (false);