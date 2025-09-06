-- Supabase Storage Bucket Setup
-- Run this in your Supabase SQL Editor

-- 1. Create the storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('construction-files', 'construction-files', true);

-- 2. Set up storage policies for the bucket
-- Allow public uploads
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'construction-files');

-- Allow public downloads  
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'construction-files');

-- Allow public deletes (optional - for file management)
CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'construction-files');

-- 3. Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'construction-files';
