-- Create function to delete old requests
CREATE OR REPLACE FUNCTION delete_old_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete requests older than 90 days
  DELETE FROM public.requests 
  WHERE created_at < (NOW() - INTERVAL '90 days');
  
  -- Log the cleanup action (optional)
  RAISE NOTICE 'Cleaned up requests older than 90 days at %', NOW();
END;
$$;

-- Create a scheduled job using pg_cron extension (if available)
-- Note: pg_cron extension must be enabled in your Supabase project
-- This runs daily at 2 AM UTC
DO $$
BEGIN
  -- Check if pg_cron extension exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Schedule the cleanup to run daily at 2 AM UTC
    PERFORM cron.schedule(
      'cleanup-old-requests', 
      '0 2 * * *', 
      'SELECT delete_old_requests();'
    );
    RAISE NOTICE 'Scheduled daily cleanup job for old requests';
  ELSE
    RAISE NOTICE 'pg_cron extension not available. Manual cleanup required.';
  END IF;
END;
$$;

-- Alternative: Create a trigger-based approach for immediate cleanup on SELECT
-- This approach checks and cleans up old records whenever the table is queried
CREATE OR REPLACE FUNCTION cleanup_on_access()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Perform cleanup of old records
  DELETE FROM public.requests 
  WHERE created_at < (NOW() - INTERVAL '90 days');
  
  RETURN NULL;
END;
$$;

-- Create trigger that runs cleanup before any SELECT operation
-- Note: This adds overhead to queries but ensures automatic cleanup
CREATE TRIGGER cleanup_old_requests_trigger
  BEFORE SELECT ON public.requests
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_on_access();