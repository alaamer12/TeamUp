-- TeamUp Supabase Migration Script

-- Drop existing table if it exists to avoid conflicts
DROP TABLE IF EXISTS public.team_members;
DROP TABLE IF EXISTS public.requests;

-- Create the requests table
CREATE TABLE IF NOT EXISTS public.requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text,
  description text,
  owner_fingerprint text NOT NULL,
  status text DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  skills text[],
  contact_email text,
  contact_discord text,
  group_size integer,
  user_name text,
  user_gender text,
  user_personal_phone text,
  user_abstract text
);

-- Create the team_members table with foreign key reference to requests
CREATE TABLE IF NOT EXISTS public.team_members (
  id bigserial PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  tech_field text[],
  gender text,
  major text,
  planguage text[],
  already_know boolean
);

-- Enable Row Level Security on both tables
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policy to allow full access to requests
CREATE POLICY IF NOT EXISTS "Allow public access to requests" 
  ON public.requests FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create policy to allow full access to team_members
CREATE POLICY IF NOT EXISTS "Allow public access to team_members" 
  ON public.team_members FOR ALL 
  USING (true) 
  WITH CHECK (true); 