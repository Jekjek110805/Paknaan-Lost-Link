CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS visual_description TEXT,
  ADD COLUMN IF NOT EXISTS embedding_json TEXT,
  ADD COLUMN IF NOT EXISTS embedding_vector vector(1536),
  ADD COLUMN IF NOT EXISTS clip_embedding_json TEXT,
  ADD COLUMN IF NOT EXISTS clip_embedding_vector vector(512);

CREATE INDEX IF NOT EXISTS items_embedding_vector_idx
  ON items
  USING ivfflat (embedding_vector vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS items_clip_embedding_vector_idx
  ON items
  USING ivfflat (clip_embedding_vector vector_cosine_ops)
  WITH (lists = 100);

-- CLIP image-to-image cosine similarity search.
-- Replace :clip_query_embedding with a vector(512) literal such as '[0.01,-0.02,...]'.
SELECT
  id,
  title,
  description,
  type,
  location,
  image_url,
  1 - (clip_embedding_vector <=> :clip_query_embedding::vector) AS similarity_score
FROM items
WHERE type IN ('lost', 'found')
  AND status IN ('posted', 'approved', 'matched', 'pending')
  AND clip_embedding_vector IS NOT NULL
ORDER BY clip_embedding_vector <=> :clip_query_embedding::vector
LIMIT 5;

-- Text/Gemini fallback cosine similarity search.
-- Replace :query_embedding with a pgvector literal such as '[0.01,-0.02,...]'.
SELECT
  id,
  title,
  description,
  location,
  image_url,
  visual_description,
  1 - (embedding_vector <=> :query_embedding::vector) AS similarity_score
FROM items
WHERE type IN ('lost', 'found')
  AND status IN ('posted', 'approved', 'matched', 'pending')
  AND embedding_vector IS NOT NULL
ORDER BY embedding_vector <=> :query_embedding::vector
LIMIT 5;
