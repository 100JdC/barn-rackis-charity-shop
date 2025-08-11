-- Fix the handle_new_user function by removing the user_roles table insertion
-- since roles are already stored in the profiles table

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
  
  -- Insert or update the profile
  INSERT INTO public.profiles (id, username, display_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    username_from_metadata,
    COALESCE(NEW.raw_user_meta_data->>'name', username_from_metadata),
    'buyer',
    NEW.created_at,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    username = EXCLUDED.username,
    updated_at = now();
    
  RETURN NEW;
END;
$$;