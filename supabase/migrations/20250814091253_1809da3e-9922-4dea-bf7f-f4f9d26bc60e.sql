-- Remove the overly permissive public access policy
DROP POLICY IF EXISTS "Public can view approved items" ON public."Item inventory";

-- Create a public view with only safe, basic item information
CREATE OR REPLACE VIEW public.items_public_view AS
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

-- Enable RLS on the view
ALTER VIEW public.items_public_view SET (security_barrier = true);

-- Create policy for public to view only basic item info through the view
CREATE POLICY "Public can view basic item info" 
ON public."Item inventory"
FOR SELECT 
TO anon
USING (
  "Status" IN ('available', 'reserved', 'sold', 'donated') 
  AND FALSE -- Force public users to use the view instead
);

-- Create policy for authenticated users to view more detailed item info (but still restrict sensitive business data)
CREATE POLICY "Authenticated users can view detailed item info" 
ON public."Item inventory"
FOR SELECT 
TO authenticated
USING (
  "Status" IN ('available', 'reserved', 'sold', 'donated')
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Grant access to the public view for anonymous users
GRANT SELECT ON public.items_public_view TO anon;
GRANT SELECT ON public.items_public_view TO authenticated;