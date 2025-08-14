-- Fix items visibility issue by adding public access to available items
-- Allow public users to view available items (but not pending/restricted ones)

CREATE POLICY "Public can view available items" 
ON public."Item inventory"
FOR SELECT 
TO public
USING ("Status" = 'available');

-- Also add a policy for authenticated buyers to view available items
CREATE POLICY "Buyers can view available items" 
ON public."Item inventory"
FOR SELECT 
TO authenticated
USING (
  ("Status" = 'available') AND 
  (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'buyer'::app_role
  ))
);