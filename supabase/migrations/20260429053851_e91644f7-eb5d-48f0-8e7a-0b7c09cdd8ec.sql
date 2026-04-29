-- Ensure pg_cron and pg_net are enabled (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any prior schedule with this name
DO $$
DECLARE jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'health-check-daily';
  IF jid IS NOT NULL THEN
    PERFORM cron.unschedule(jid);
  END IF;
END $$;

-- Schedule daily at 18:00 UTC = 04:00 AEST (next day)
SELECT cron.schedule(
  'health-check-daily',
  '0 18 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://nzjgmkyqedausyancdjl.supabase.co/functions/v1/health-check-cron',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56amdta3lxZWRhdXN5YW5jZGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzk4NjIsImV4cCI6MjA4NDYxNTg2Mn0.hOZ3UbVlGKGq4_vS8pWb7UzsGx3uv08d5iV0A4gSZik"}'::jsonb,
    body := '{}'::jsonb
  );
  $cron$
);