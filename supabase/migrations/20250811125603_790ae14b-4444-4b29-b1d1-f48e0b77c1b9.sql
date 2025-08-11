-- Update the RLS policy to allow admins to insert items with any status
DROP POLICY IF EXISTS "Authenticated users can submit items for approval" ON "Item inventory";

-- Create new policy that allows regular users to submit pending items and admins to submit available items
CREATE POLICY "Users can submit items based on role" 
ON "Item inventory" 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL) AND 
  (
    -- Regular users can only submit pending items
    ("Status" = 'pending_approval'::text AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'buyer'::app_role
    )) 
    OR 
    -- Admins can submit items with any status
    (EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'::app_role
    ))
  )
);