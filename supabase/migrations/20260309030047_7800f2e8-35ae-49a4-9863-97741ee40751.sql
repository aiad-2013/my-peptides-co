
CREATE TABLE public.lab_test_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lab_test_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lab test request"
  ON public.lab_test_requests
  FOR INSERT
  WITH CHECK (true);
