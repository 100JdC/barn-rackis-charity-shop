-- Security improvements: Fix database function security (views cannot have RLS)

-- Fix database function security by setting proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public, auth
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Create admin user creation function with better security
CREATE OR REPLACE FUNCTION public.create_admin_user()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, auth
AS $$
BEGIN
  -- This function will be used to create the admin user through the application
  RAISE NOTICE 'Admin user creation function ready';
END;
$$;

-- Improve the username/email sign in function security
CREATE OR REPLACE FUNCTION public.handle_username_or_email_sign_in()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, auth
AS $$
DECLARE
  username_from_metadata text;
  matching_user uuid;
BEGIN
  -- Check if the input looks like an email
  IF NEW.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    -- This is an email, proceed normally
    RETURN NEW;
  END IF;
  
  -- Not an email, so treat it as a username
  -- Find the user with this username in profiles
  SELECT id INTO matching_user
  FROM public.profiles
  WHERE username = LOWER(NEW.email);
  
  -- If we found a matching user
  IF matching_user IS NOT NULL THEN
    -- Get the actual email for this user
    SELECT email INTO NEW.email
    FROM auth.users
    WHERE id = matching_user;
    
    -- Return the modified record with the real email
    RETURN NEW;
  END IF;
  
  -- No matching username found, return the original record
  -- (which will likely fail authentication since it's not a valid email)
  RETURN NEW;
END;
$$;

-- Improve the new user creation function security
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, auth
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