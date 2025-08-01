-- Add unique constraint to user_roles table to prevent conflicts
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_role_unique 
UNIQUE (user_id, role);