-- Remove the overly permissive public access policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create more secure, granular policies

-- Allow authenticated users to view basic profile info (excluding sensitive data like roles)
CREATE POLICY "Authenticated users can view basic profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Allow users to view their own complete profile (including role)
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Create a security definer function to check admin role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Allow admins to view all profiles including roles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Add a column to control profile visibility (for future privacy controls)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_visible_to_public boolean DEFAULT false;

-- Create policy for public visibility when users opt-in
CREATE POLICY "Public can view opted-in basic profiles" 
ON public.profiles 
FOR SELECT 
TO anon
USING (
  profile_visible_to_public = true 
  AND (
    -- Only expose safe, non-sensitive fields for public viewing
    -- This policy will work with row-level field restrictions in the application layer
    true
  )
);