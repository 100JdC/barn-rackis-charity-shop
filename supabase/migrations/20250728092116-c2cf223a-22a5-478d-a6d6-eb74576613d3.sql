-- Drop existing enum if it exists with wrong values
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Create the app_role enum type with correct values
CREATE TYPE public.app_role AS ENUM ('admin', 'donor', 'buyer');

-- Make sure the profiles table has the role column with proper type
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS role;

ALTER TABLE public.profiles 
ADD COLUMN role app_role DEFAULT 'buyer'::app_role;

-- Make sure the user_roles table has the role column with proper type
ALTER TABLE public.user_roles 
DROP COLUMN IF EXISTS role;

ALTER TABLE public.user_roles 
ADD COLUMN role app_role NOT NULL;

-- Recreate the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  username_from_metadata text;
BEGIN
  -- Extract username from metadata if it exists
  username_from_metadata := NEW.raw_user_meta_data->>'username';
  
  -- If no username in metadata, use the part before @ in email
  IF username_from_metadata IS NULL OR username_from_metadata = '' THEN
    username_from_metadata := SPLIT_PART(NEW.email, '@', 1);
  END IF;
  
  -- Make username lowercase for consistency
  username_from_metadata := LOWER(username_from_metadata);
  
  -- Check if username already exists and make it unique
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = username_from_metadata AND id != NEW.id) LOOP
    username_from_metadata := username_from_metadata || '_' || FLOOR(RANDOM() * 1000)::text;
  END LOOP;
  
  -- Insert or update the profile (default role is buyer)
  INSERT INTO public.profiles (id, username, display_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    username_from_metadata,
    COALESCE(NEW.raw_user_meta_data->>'name', username_from_metadata),
    'buyer'::app_role,
    NEW.created_at,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    username = EXCLUDED.username,
    updated_at = now();
  
  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
    
  RETURN NEW;
END;
$$;