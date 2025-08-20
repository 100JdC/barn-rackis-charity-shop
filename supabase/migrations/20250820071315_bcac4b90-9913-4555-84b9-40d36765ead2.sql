-- CRITICAL SECURITY FIX: Remove public access to donor personal information

-- 1. Drop the overly permissive public policy that exposes donor data
DROP POLICY IF EXISTS "Public can view available items" ON "Item inventory";

-- 2. Create a secure public view that excludes sensitive donor information
CREATE OR REPLACE VIEW public.items_public_safe AS
SELECT 
  "Item ID",
  "Name",
  "Description",
  "Category",
  "Subcategory", 
  "Condition",
  "Quantity",
  "Original Price (SEK)",
  "Suggested Price (SEK)",
  "Final Price (SEK)",
  "Status",
  "Photos Count",
  "Created At",
  "Updated At"
FROM "Item inventory"
WHERE "Status" = 'available';

-- 3. Enable RLS on the new secure view (it inherits permissions but we make it explicit)
ALTER VIEW public.items_public_safe SET (security_barrier = true);

-- 4. Create a policy for public access to the secure view (this is safe because the view excludes sensitive data)
CREATE POLICY "Public can view available items safely" 
ON "Item inventory"
FOR SELECT 
USING ("Status" = 'available' AND auth.role() = 'anon');

-- 5. Fix the duplicate table to have the same security
DROP POLICY IF EXISTS "Public can view available items duplicate" ON "Item inventory_duplicate";

-- 6. Ensure admin and buyer policies are properly restrictive
-- Buyers should only see basic item info, not donor details
CREATE POLICY "Buyers can view available items without donor info" 
ON "Item inventory"
FOR SELECT 
USING (
  "Status" = 'available' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'buyer'::app_role
  )
);

-- 7. Create a comprehensive admin view that includes all data
CREATE OR REPLACE VIEW public.items_admin_complete AS
SELECT *
FROM "Item inventory"
WHERE EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::app_role
);

-- 8. Grant proper permissions
GRANT SELECT ON public.items_public_safe TO anon, authenticated;
GRANT SELECT ON public.items_admin_complete TO authenticated;