-- Update the handle_new_user function to assign buyer role by default (admin will be assigned manually)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  username_from_metadata text;
  user_role text;
BEGIN
  -- Extract username from metadata if it exists
  username_from_metadata := NEW.raw_user_meta_data->>'username';
  
  -- If no username in metadata, use the part before @ in email
  IF username_from_metadata IS NULL OR username_from_metadata = '' THEN
    username_from_metadata := SPLIT_PART(NEW.email, '@', 1);
  END IF;
  
  -- Make username lowercase for consistency
  username_from_metadata := LOWER(username_from_metadata);
  
  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = username_from_metadata AND id != NEW.id) THEN
    -- Username exists, append random numbers to make it unique
    username_from_metadata := username_from_metadata || '_' || FLOOR(RANDOM() * 1000)::text;
  END IF;
  
  -- Default role is buyer (admin will be assigned manually in Supabase)
  user_role := 'buyer';
  
  -- Insert or update the profile
  INSERT INTO public.profiles (id, username, display_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    username_from_metadata,
    COALESCE(NEW.raw_user_meta_data->>'name', username_from_metadata),
    user_role::app_role,
    NEW.created_at,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    username = EXCLUDED.username,
    role = EXCLUDED.role::app_role,
    updated_at = now();
  
  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
    
  RETURN NEW;
END;
$$;