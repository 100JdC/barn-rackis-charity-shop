-- Test inserting a simple profile to see if the enum works
INSERT INTO public.profiles (id, username, display_name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test_user_' || FLOOR(RANDOM() * 1000)::text,
  'Test User',
  'buyer',
  now(),
  now()
);