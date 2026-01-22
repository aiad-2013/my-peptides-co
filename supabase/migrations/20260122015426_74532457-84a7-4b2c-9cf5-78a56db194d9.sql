-- Add permissive policy allowing users to view their own orders by email
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (customer_email = auth.jwt() ->> 'email');