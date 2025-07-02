-- Enable Row Level Security on Item inventory table
ALTER TABLE public."Item inventory" ENABLE ROW LEVEL SECURITY;

-- Create policies for Item inventory table (allow all operations for now, can be restricted later)
CREATE POLICY "Allow all operations on Item inventory" 
ON public."Item inventory" 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create storage policies for photos bucket
CREATE POLICY "Allow public read access to photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photos');

CREATE POLICY "Allow authenticated users to upload photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Allow authenticated users to update photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'photos');

CREATE POLICY "Allow authenticated users to delete photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'photos');