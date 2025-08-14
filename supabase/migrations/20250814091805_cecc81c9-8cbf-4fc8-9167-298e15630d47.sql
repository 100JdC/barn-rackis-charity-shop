-- Fix Security Definer Views
-- Remove SECURITY DEFINER from existing views to prevent privilege escalation

-- Check what views currently exist with SECURITY DEFINER
-- First, let's recreate the views without SECURITY DEFINER

-- Drop and recreate items_public_view without SECURITY DEFINER
DROP VIEW IF EXISTS public.items_public_view;
CREATE VIEW public.items_public_view AS
SELECT 
  "Item ID",
  "Name", 
  "Description",
  "Category",
  "Subcategory",
  "Condition",
  "Quantity",
  "Status",
  "Photos Count",
  "Created At"
FROM public."Item inventory"
WHERE "Status" IN ('available', 'reserved', 'sold', 'donated');

-- Drop and recreate items_public_secure without SECURITY DEFINER  
DROP VIEW IF EXISTS public.items_public_secure;
CREATE VIEW public.items_public_secure AS
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

-- Grant appropriate permissions 
GRANT SELECT ON public.items_public_view TO anon, authenticated;
GRANT SELECT ON public.items_public_secure TO anon, authenticated;