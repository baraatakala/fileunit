-- Construction File Sharing Platform - Supabase Setup
-- Run these commands in your Supabase SQL Editor

-- 1. Create files table
CREATE TABLE public.files (
    id BIGSERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    content_type TEXT,
    public_url TEXT,
    uploaded_by TEXT DEFAULT 'anonymous',
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    unique_filename TEXT NOT NULL,
    description TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create storage bucket (run this in Supabase Storage section)
-- Go to Storage -> Create a new bucket named: construction-files
-- Make it public or configure policies as needed

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view files
CREATE POLICY "Anyone can view files" ON public.files
    FOR SELECT USING (true);

-- Policy: Anyone can insert files (you can restrict this later)
CREATE POLICY "Anyone can insert files" ON public.files
    FOR INSERT WITH CHECK (true);

-- Policy: Only file uploader can delete their files
CREATE POLICY "Users can delete their own files" ON public.files
    FOR DELETE USING (uploaded_by = auth.jwt() ->> 'sub' OR uploaded_by = 'anonymous');

-- 4. Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.files
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Create indexes for better performance
CREATE INDEX idx_files_uploaded_at ON public.files (uploaded_at DESC);
CREATE INDEX idx_files_uploaded_by ON public.files (uploaded_by);
CREATE INDEX idx_files_filename ON public.files (filename);

-- 6. Storage policies for the construction-files bucket
-- Go to Storage -> construction-files -> Policies and add:

-- Policy 1: Allow public read access
-- INSERT INTO storage.policies (name, bucket_id, policy, definition) VALUES (
--   'Public read access',
--   'construction-files',
--   'SELECT',
--   '(bucket_id = ''construction-files'')'
-- );

-- Policy 2: Allow authenticated uploads
-- INSERT INTO storage.policies (name, bucket_id, policy, definition) VALUES (
--   'Allow authenticated uploads',
--   'construction-files', 
--   'INSERT',
--   '(bucket_id = ''construction-files'')'
-- );

-- 7. Test data (optional)
-- INSERT INTO public.files (filename, file_path, file_size, content_type, public_url, uploaded_by, unique_filename)
-- VALUES (
--     'test-document.pdf',
--     'uploads/test-document.pdf',
--     1024000,
--     'application/pdf',
--     'https://vdyuepooqnkwyxnjncva.supabase.co/storage/v1/object/public/construction-files/uploads/test-document.pdf',
--     'test-user',
--     'test-document.pdf'
-- );
