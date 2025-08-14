-- Fix security issue: Apply RLS policies to duplicate inventory table
-- The 'Item inventory_duplicate' table lacks RLS policies, creating a security bypass

-- First, enable RLS on the duplicate table
ALTER TABLE public."Item inventory_duplicate" ENABLE ROW LEVEL SECURITY;

-- Apply the same RLS policies as the main inventory table
-- Policy 1: Admins can view all items in duplicate table
CREATE POLICY "Admins can view all items duplicate" 
ON public."Item inventory_duplicate"
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::app_role
  )
);

-- Policy 2: Admins can update items in duplicate table
CREATE POLICY "Admins can update items duplicate" 
ON public."Item inventory_duplicate"
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::app_role
  )
);

-- Policy 3: Admins can delete items in duplicate table
CREATE POLICY "Admins can delete items duplicate" 
ON public."Item inventory_duplicate"
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::app_role
  )
);

-- Policy 4: Users can submit items based on role (same as main table)
CREATE POLICY "Users can submit items based on role duplicate" 
ON public."Item inventory_duplicate"
FOR INSERT 
TO authenticated
WITH CHECK (
  (auth.uid() IS NOT NULL) AND 
  (
    (("Status" = 'pending_approval'::text) AND 
     (EXISTS (
       SELECT 1 FROM public.profiles 
       WHERE profiles.id = auth.uid() 
       AND profiles.role = 'buyer'::app_role
     ))
    ) OR 
    (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'::app_role
    ))
  )
);

-- Revoke any existing broad permissions
REVOKE ALL ON public."Item inventory_duplicate" FROM anon;
REVOKE ALL ON public."Item inventory_duplicate" FROM authenticated;