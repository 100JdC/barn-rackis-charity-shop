-- Update the most recently created user to admin role (assuming that's you)
UPDATE public.profiles 
SET role = 'admin' 
WHERE username = 'isa';

UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = (SELECT id FROM public.profiles WHERE username = 'isa');