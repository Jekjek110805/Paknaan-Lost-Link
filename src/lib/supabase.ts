import { createClient } from '@supabase/supabase-js'

// Client-side: uses VITE_ prefixed env vars (available in browser)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

const ITEM_IMAGES_BUCKET = 'item-images'
const PROOF_IMAGES_BUCKET = 'proof-images'

/**
 * Upload an image file to the Supabase item-images bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadItemImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg'
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`
  const filePath = `items/${fileName}`

  const { error, data } = await supabase.storage
    .from(ITEM_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Supabase upload error:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  return getPublicUrl(filePath)
}

/**
 * Upload a proof image for claims verification (private bucket).
 */
export async function uploadProofImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg'
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`
  const filePath = `proofs/${fileName}`

  const { error } = await supabase.storage
    .from(PROOF_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Supabase proof upload error:', error)
    throw new Error(`Failed to upload proof image: ${error.message}`)
  }

  return getProofUrl(filePath)
}

/**
 * Get the public URL for an image in the item-images bucket.
 */
export function getPublicUrl(filePath: string): string {
  const { data } = supabase.storage
    .from(ITEM_IMAGES_BUCKET)
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Get the signed URL for a private proof image (valid for 1 hour).
 */
export async function getProofUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(PROOF_IMAGES_BUCKET)
    .createSignedUrl(filePath, 3600)

  if (error) {
    console.error('Supabase signed URL error:', error)
    throw new Error(`Failed to get proof URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Delete an image from the item-images bucket.
 */
export async function deleteItemImage(filePath: string): Promise<void> {
  // filePath can be a full URL — extract just the path
  const path = extractStoragePath(filePath, ITEM_IMAGES_BUCKET)

  const { error } = await supabase.storage
    .from(ITEM_IMAGES_BUCKET)
    .remove([path])

  if (error) {
    console.error('Supabase delete error:', error)
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

/**
 * Delete a proof image from the proof-images bucket.
 */
export async function deleteProofImage(filePath: string): Promise<void> {
  const path = extractStoragePath(filePath, PROOF_IMAGES_BUCKET)

  const { error } = await supabase.storage
    .from(PROOF_IMAGES_BUCKET)
    .remove([path])

  if (error) {
    console.error('Supabase proof delete error:', error)
    throw new Error(`Failed to delete proof image: ${error.message}`)
  }
}

/**
 * Extract the storage path from a full Supabase public URL.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/item-images/items/abc.jpg"
 *   -> "items/abc.jpg"
 */
function extractStoragePath(urlOrPath: string, bucket: string): string {
  const publicPrefix = `/storage/v1/object/public/${bucket}/`
  const signedPrefix = `/storage/v1/object/sign/${bucket}/`

  const publicIdx = urlOrPath.indexOf(publicPrefix)
  if (publicIdx !== -1) {
    return urlOrPath.slice(publicIdx + publicPrefix.length)
  }

  const signedIdx = urlOrPath.indexOf(signedPrefix)
  if (signedIdx !== -1) {
    return urlOrPath.slice(signedIdx + signedPrefix.length)
  }

  // Assume it's already a bare path
  return urlOrPath
}

/**
 * Check if Supabase is configured and reachable.
 */
export async function isSupabaseConfigured(): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) return false

  try {
    const { error } = await supabase.storage.getBucket(ITEM_IMAGES_BUCKET)
    return !error
  } catch {
    return false
  }
}
