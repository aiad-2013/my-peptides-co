
CREATE TABLE IF NOT EXISTS public.diagnostics_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date date NOT NULL UNIQUE,
  sent_at timestamptz NOT NULL DEFAULT now(),
  failures_count int NOT NULL DEFAULT 0,
  message_id text
);

ALTER TABLE public.diagnostics_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view diagnostics email log"
ON public.diagnostics_email_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
