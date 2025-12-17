-- ==============================================================================
-- FIX: Allow Avatar Uploads
-- Run this script in your Supabase SQL Editor to fix the "violates row-level security policy" error.
-- ==============================================================================

-- 1. Ensure the 'avatars' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable RLS on storage.objects (just in case)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Remove existing conflicting policies to avoid errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "User Update" ON storage.objects;
DROP POLICY IF EXISTS "User Delete" ON storage.objects;

-- 4. Allow PUBLIC (everyone) to VIEW images in the 'avatars' bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 5. Allow AUTHENTICATED users to UPLOAD images to the 'avatars' bucket
CREATE POLICY "Authenticated Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- 6. Allow users to UPDATE their own images
CREATE POLICY "User Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- 7. Allow users to DELETE their own images
CREATE POLICY "User Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- Done! You should now be able to upload profile pictures.
