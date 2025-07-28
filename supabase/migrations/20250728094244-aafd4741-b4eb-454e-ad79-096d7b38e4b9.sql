-- Create RLS policies for Item inventory table with approval workflow

-- Policy 1: Everyone can view approved items (available, reserved, sold, donated)
CREATE POLICY "Public can view approved items" 
ON "Item inventory" 
FOR SELECT 
USING ("Status" IN ('available', 'reserved', 'sold', 'donated'));

-- Policy 2: Authenticated users can submit items for approval
CREATE POLICY "Authenticated users can submit items for approval" 
ON "Item inventory" 
FOR INSERT 
TO authenticated
WITH CHECK ("Status" = 'pending_approval');

-- Policy 3: Admins can view all items (including pending)
CREATE POLICY "Admins can view all items" 
ON "Item inventory" 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 4: Admins can update items (approve/reject)
CREATE POLICY "Admins can update items" 
ON "Item inventory" 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 5: Admins can delete items
CREATE POLICY "Admins can delete items" 
ON "Item inventory" 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);