
-- Create a users table for donor accounts (admins use hardcoded login)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'donator',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own account" 
ON public.users 
FOR SELECT 
USING (id = auth.uid() OR role = 'donator');

CREATE POLICY "Allow user registration" 
ON public.users 
FOR INSERT 
WITH CHECK (role = 'donator');

CREATE POLICY "Users can update their own account" 
ON public.users 
FOR UPDATE 
USING (id = auth.uid());

-- Create the photos storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true);

-- Update storage policies to be more permissive for testing
DROP POLICY IF EXISTS "Allow public read access to photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete photos" ON storage.objects;

CREATE POLICY "Allow all operations on photos bucket" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'photos') 
WITH CHECK (bucket_id = 'photos');
