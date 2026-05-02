CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS visual_description TEXT,
  ADD COLUMN IF NOT EXISTS embedding_json TEXT,
  ADD COLUMN IF NOT EXISTS embedding_vector vector(1536);

CREATE INDEX IF NOT EXISTS items_embedding_vector_idx
  ON items
  USING ivfflat (embedding_vector vector_cosine_ops)
  WITH (lists = 100);

-- Cosine similarity search for the top five found-item matches.
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
WHERE type = 'found'
  AND status IN ('posted', 'approved', 'matched')
  AND embedding_vector IS NOT NULL
ORDER BY embedding_vector <=> :query_embedding::vector
LIMIT 5;
