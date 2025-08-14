-- Fix security definer view issue by removing security_barrier
-- and ensuring proper RLS policies handle access control

-- Remove the security_barrier property from the view
ALTER VIEW public.items_public_view SET (security_barrier = false);

-- Update the overly restrictive policy that forces FALSE for anon users
DROP POLICY IF EXISTS "Public can view basic item info" ON public."Item inventory";

-- Create a proper policy for anonymous users to view approved items
CREATE POLICY "Public can view approved items" 
ON public."Item inventory"
FOR SELECT 
TO anon
USING (
  "Status" IN ('available', 'reserved', 'sold', 'donated')
);

-- Update the authenticated user policy to remove the admin exclusion
DROP POLICY IF EXISTS "Authenticated users can view detailed item info" ON public."Item inventory";

CREATE POLICY "Authenticated users can view approved items" 
ON public."Item inventory"
FOR SELECT 
TO authenticated
USING (
  "Status" IN ('available', 'reserved', 'sold', 'donated')
);