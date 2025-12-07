-- Airport Data Sync - Weekly Cron Job Setup
-- This SQL script sets up a weekly automated sync for airport data
-- Run this in the Supabase SQL Editor

-- ========================================
-- STEP 1: Enable pg_cron extension
-- ========================================
-- Go to Supabase Dashboard > Database > Extensions
-- Find "pg_cron" and enable it
-- OR run this command (if you have permissions):
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ========================================
-- STEP 2: Create the cron job
-- ========================================
-- This schedules the airport sync to run every Sunday at 2:00 AM UTC

SELECT cron.schedule(
  'weekly-airport-data-sync',           -- Job name
  '0 2 * * 0',                          -- Cron expression: Every Sunday at 2:00 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-d89dc2de/sync/cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- ========================================
-- IMPORTANT: Replace the placeholders
-- ========================================
-- Replace YOUR_PROJECT_ID with your actual Supabase project ID
-- Replace YOUR_ANON_KEY with your actual Supabase anon key
-- You can find these in: Supabase Dashboard > Settings > API

-- ========================================
-- STEP 3: Verify the cron job
-- ========================================
-- Check that the job was created successfully
SELECT * FROM cron.job WHERE jobname = 'weekly-airport-data-sync';

-- Expected output:
-- jobid | schedule    | command                                          | nodename  | nodeport | database | username | active | jobname
-- ------|-------------|--------------------------------------------------|-----------|----------|----------|----------|--------|--------
-- 1     | 0 2 * * 0   | SELECT net.http_post(...)                       | localhost | 5432     | postgres | postgres | t      | weekly-airport-data-sync

-- ========================================
-- STEP 4: Monitor cron job executions
-- ========================================
-- View recent cron job runs
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'weekly-airport-data-sync')
ORDER BY start_time DESC
LIMIT 10;

-- ========================================
-- STEP 5: Test the cron job manually
-- ========================================
-- You can manually trigger the cron job to test it
-- This will execute the job immediately without waiting for the schedule
SELECT cron.schedule(
  'test-airport-sync-once',
  '* * * * *',  -- Run every minute (for testing)
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-d89dc2de/sync/cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Wait a minute, then check the results
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'test-airport-sync-once')
ORDER BY start_time DESC;

-- Once verified, remove the test job
SELECT cron.unschedule('test-airport-sync-once');

-- ========================================
-- MAINTENANCE COMMANDS
-- ========================================

-- Update the schedule (e.g., change to every Monday at 3:00 AM)
SELECT cron.schedule(
  'weekly-airport-data-sync',
  '0 3 * * 1',  -- Monday at 3:00 AM
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-d89dc2de/sync/cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Disable the cron job (keeps it in database but stops execution)
UPDATE cron.job SET active = false WHERE jobname = 'weekly-airport-data-sync';

-- Enable the cron job
UPDATE cron.job SET active = true WHERE jobname = 'weekly-airport-data-sync';

-- Delete the cron job completely
SELECT cron.unschedule('weekly-airport-data-sync');

-- View all cron jobs
SELECT * FROM cron.job;

-- Clean up old job run history (keeps last 100 runs)
DELETE FROM cron.job_run_details
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname = 'weekly-airport-data-sync')
AND runid NOT IN (
  SELECT runid FROM cron.job_run_details
  WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname = 'weekly-airport-data-sync')
  ORDER BY start_time DESC
  LIMIT 100
);

-- ========================================
-- CRON EXPRESSION GUIDE
-- ========================================
-- Format: minute hour day month day_of_week
--
-- Examples:
-- '0 2 * * 0'     - Every Sunday at 2:00 AM
-- '0 3 * * 1'     - Every Monday at 3:00 AM
-- '0 1 * * 1-5'   - Every weekday at 1:00 AM
-- '0 0 1 * *'     - First day of every month at midnight
-- '30 14 * * 6'   - Every Saturday at 2:30 PM
-- '0 */6 * * *'   - Every 6 hours
-- '0 0 * * *'     - Daily at midnight
--
-- Special characters:
-- * (asterisk)    - Any value
-- , (comma)       - Value list separator
-- - (dash)        - Range of values
-- / (slash)       - Step values

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- Issue: Cron job not running
-- Solution 1: Check if pg_cron extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Solution 2: Verify the job is active
SELECT jobname, active FROM cron.job WHERE jobname = 'weekly-airport-data-sync';

-- Solution 3: Check for errors in job run details
SELECT status, return_message FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'weekly-airport-data-sync')
ORDER BY start_time DESC LIMIT 5;

-- Issue: HTTP request failing
-- Solution: Test the endpoint manually using the manual sync button in the UI
-- or via curl:
-- curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-d89dc2de/sync/cron \
--   -H "Authorization: Bearer YOUR_ANON_KEY"

-- Issue: Need to see raw HTTP response
-- Solution: Query the Supabase logs or add logging to the edge function
