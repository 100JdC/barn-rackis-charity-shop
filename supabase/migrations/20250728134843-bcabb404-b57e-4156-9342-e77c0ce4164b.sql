-- Update all existing 'buyer' roles to 'donor' since we removed buyer role
UPDATE profiles SET role = 'donor' WHERE role = 'buyer';

-- Make user tyskoph1 an admin (based on the auth logs showing this user is active)
UPDATE profiles SET role = 'admin' WHERE username = 'tyskoph1';