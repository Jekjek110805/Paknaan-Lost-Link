-- ============================================================================
-- Paknaan LostLink - Supabase Schema Migration
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE user_role AS ENUM ('admin', 'official', 'resident');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending');
CREATE TYPE item_type AS ENUM ('lost', 'found');
CREATE TYPE item_status AS ENUM ('posted', 'approved', 'matched', 'claimed', 'resolved', 'pending', 'rejected');
CREATE TYPE claim_status AS ENUM ('pending', 'verified', 'approved', 'rejected');

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT,                          -- NULL for OAuth users
  role user_role NOT NULL DEFAULT 'resident',
  provider TEXT NOT NULL DEFAULT 'local', -- 'local' or 'google'
  email_verified BOOLEAN NOT NULL DEFAULT false,
  status user_status NOT NULL DEFAULT 'pending',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- ============================================================================
-- ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type item_type NOT NULL,
  category TEXT NOT NULL DEFAULT 'Others',
  location TEXT NOT NULL DEFAULT '',
  zone TEXT NOT NULL DEFAULT '',
  date_lost_found DATE,
  image_url TEXT,
  status item_status NOT NULL DEFAULT 'posted',
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_name TEXT NOT NULL DEFAULT '',
  reporter_contact TEXT NOT NULL DEFAULT '',
  visual_description TEXT,
  embedding_json TEXT,
  clip_embedding_json TEXT,
  image_hash TEXT,
  claim_qr_id UUID UNIQUE DEFAULT gen_random_uuid(),
  matched_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_type ON items (type);
CREATE INDEX IF NOT EXISTS idx_items_status ON items (status);
CREATE INDEX IF NOT EXISTS idx_items_reporter ON items (reporter_id);
CREATE INDEX IF NOT EXISTS idx_items_matched ON items (matched_item_id);
CREATE INDEX IF NOT EXISTS idx_items_claim_qr ON items (claim_qr_id);

-- ============================================================================
-- CLAIMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  claimant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  claimant_name TEXT NOT NULL DEFAULT '',
  claimant_contact TEXT NOT NULL DEFAULT '',
  proof_description TEXT NOT NULL DEFAULT '',
  proof_image_url TEXT,
  status claim_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_item ON claims (item_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimant ON claims (claimant_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims (status);

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs (entity_type, entity_id);

-- ============================================================================
-- APP METADATA (for schema version tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_metadata (key, value) 
VALUES ('schema_version', '001')
ON CONFLICT (key) DO UPDATE SET value = '001', updated_at = NOW();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Users: anyone can read; only admins can insert/update/delete
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Items: anyone can read; authenticated can create; owner/admin can update
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items are viewable by everyone" ON items
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert items" ON items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Reporter or admin can update items" ON items
  FOR UPDATE USING (
    auth.uid() = reporter_id 
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'official'))
  );

-- Claims: reporter, claimant, or admin can read; authenticated can create
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Claims are viewable by involved parties" ON claims
  FOR SELECT USING (
    auth.uid() = claimant_id
    OR EXISTS (SELECT 1 FROM items WHERE id = claims.item_id AND reporter_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'official'))
  );

CREATE POLICY "Authenticated users can insert claims" ON claims
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Audit logs: only admins can read
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'official'))
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
