
-- Delete unused columns
ALTER TABLE public.requests
DROP COLUMN contact_discord,
DROP COLUMN group_size,
DROP COLUMN contact_email,
DROP COLUMN skills,
DROP COLUMN description,
DROP COLUMN title;
