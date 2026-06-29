-- ============================================================================
-- Paknaan LostLink - Supabase Storage Migration
-- Run this in the Supabase SQL Editor AFTER 001_schema.sql
-- ============================================================================

-- ============================================================================
-- STORAGE BUCKET: item-images
-- Stores uploaded images for lost/found items
-- ============================================================================

-- 1. Create the bucket (public access for reading images)
-- Run this via Supabase Dashboard > Storage > New Bucket, or use the SQL below:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images',
  true,                        -- public bucket so images are viewable by anyone
  10485760,                    -- 10 MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS Policies for item-images bucket

-- Anyone can view/download images (public bucket)
CREATE POLICY "Anyone can view item images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'item-images');

-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload item images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'item-images'
  AND auth.role() = 'authenticated'
);

-- Users can update their own uploads
CREATE POLICY "Users can update own item images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'item-images'
  AND auth.uid() = owner
);

-- Users can delete their own uploads, admins can delete any
CREATE POLICY "Owners and admins can delete item images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'item-images'
  AND (
    auth.uid() = owner
    OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'official'))
  )
);

-- ============================================================================
-- STORAGE BUCKET: proof-images
-- Stores proof images submitted during claim verification
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proof-images',
  'proof-images',
  false,                       -- private bucket — only accessible to admins/reporter/claimant
  10485760,                    -- 10 MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Only authenticated users can view proof images
CREATE POLICY "Authenticated users can view proof images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'proof-images'
  AND auth.role() = 'authenticated'
);

-- Authenticated users can upload proof images
CREATE POLICY "Authenticated users can upload proof images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'proof-images'
  AND auth.role() = 'authenticated'
);

-- Users can update their own proof uploads
CREATE POLICY "Users can update own proof images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'proof-images'
  AND auth.uid() = owner
);

-- Owners and admins can delete proof images
CREATE POLICY "Owners and admins can delete proof images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'proof-images'
  AND (
    auth.uid() = owner
    OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'official'))
  )
