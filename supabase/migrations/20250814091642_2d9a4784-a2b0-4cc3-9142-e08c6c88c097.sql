-- Fix donor personal information exposure
-- Create a secure view that excludes sensitive donor information from public access

-- First, drop the existing policies that allow full table access
DROP POLICY IF EXISTS "Public can view approved items" ON public."Item inventory";
DROP POLICY IF EXISTS "Authenticated users can view approved items" ON public."Item inventory";

-- Create a secure public view that excludes donor personal information
CREATE OR REPLACE VIEW public.items_public_secure AS
SELECT 
  "Item ID",
  "Name",
  "Description",
  "Category",
  "Subcategory", 
  "Condition",
  "Quantity",
  "Suggested Price (SEK)",
  "Final Price (SEK)",
  "Status",
  "Photos Count",
  "Created At",
  "Updated At"
  -- Explicitly exclude: "Donor Name", "Internal Notes", "Reserved By", "Created By", "Updated By"
FROM public."Item inventory"
WHERE "Status" IN ('available', 'reserved', 'sold', 'donated');

-- Grant SELECT on the secure view to anon and authenticated users
GRANT SELECT ON public.items_public_secure TO anon;
GRANT SELECT ON public.items_public_secure TO authenticated;

-- Ensure only admins can access the full table with sensitive information
CREATE POLICY "Admins can view all item details including donor info" 
ON public."Item inventory"
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::app_role
  )
);

-- Allow public to view only through the secure view (handled by view permissions above)
-- No direct table access policies for anon/non-admin users