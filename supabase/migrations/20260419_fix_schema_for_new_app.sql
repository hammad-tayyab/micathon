/*
  # Nighabaan Schema Fix — New City-Based Job Marketplace

  This migration cleanly drops the old escrow schema and replaces it
  with the simplified city-based job marketplace schema.

  Changes vs old schema:
  - users.role: 'homeowner'|'worker'  →  'owner'|'worker'
  - users: adds `city` column
  - jobs: drops total_amount, homeowner_id, worker_id, proof_note
  - jobs: adds city, homeowner_id (renamed semantics), accepted_by (uuid[])
  - jobs.status: 'active'|'funds_secured'|...  →  'open'|'hired'|'closed'
  - Drops old tables: transactions
  - Drops old RPC functions: lock_funds, release_funds, request_release
*/

-- ============================================================
-- STEP 1: DROP OLD OBJECTS
-- ============================================================

DROP FUNCTION IF EXISTS lock_funds(uuid, uuid);
DROP FUNCTION IF EXISTS release_funds(uuid, uuid);
DROP FUNCTION IF EXISTS request_release(uuid, uuid, text);

DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- STEP 2: CREATE NEW TABLES
-- ============================================================

CREATE TABLE users (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone        text UNIQUE NOT NULL,
  name         text NOT NULL,
  role         text NOT NULL DEFAULT 'worker' CHECK (role IN ('owner', 'worker')),
  city         text NOT NULL DEFAULT '',
  balance_pkr  numeric NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text DEFAULT '',
  city          text NOT NULL DEFAULT '',
  homeowner_id  uuid REFERENCES users(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'hired', 'closed')),
  accepted_by   uuid[] NOT NULL DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- STEP 3: INDEXES
-- ============================================================

CREATE INDEX idx_jobs_homeowner  ON jobs(homeowner_id);
CREATE INDEX idx_jobs_city       ON jobs(city);
CREATE INDEX idx_users_phone     ON users(phone);

-- ============================================================
-- STEP 4: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs  ENABLE ROW LEVEL SECURITY;

-- Allow anon to read/write everything (phone-based auth, no OTP)
CREATE POLICY "anon_select_users" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_users" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_users" ON users FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_select_jobs"  ON jobs  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_jobs"  ON jobs  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_jobs"  ON jobs  FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_jobs"  ON jobs  FOR DELETE TO anon USING (true);

-- ============================================================
-- STEP 5: SEED DATA (safe to re-run — idempotent)
-- ============================================================

DO $$
DECLARE
  v_owner_id  uuid;
  v_worker_id uuid;
BEGIN
  -- Seed Owner
  IF NOT EXISTS (SELECT 1 FROM users WHERE phone = '03001234567') THEN
    INSERT INTO users(phone, name, role, city, balance_pkr)
    VALUES ('03001234567', 'Asad Khan', 'owner', 'karachi', 85000)
    RETURNING id INTO v_owner_id;
  ELSE
    SELECT id INTO v_owner_id FROM users WHERE phone = '03001234567';
  END IF;

  -- Seed Worker
  IF NOT EXISTS (SELECT 1 FROM users WHERE phone = '03009876543') THEN
    INSERT INTO users(phone, name, role, city, balance_pkr)
    VALUES ('03009876543', 'Rafiq Ahmed', 'worker', 'karachi', 0)
    RETURNING id INTO v_worker_id;
  ELSE
    SELECT id INTO v_worker_id FROM users WHERE phone = '03009876543';
  END IF;

  -- Seed sample jobs
  IF NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Bathroom Tiling' AND homeowner_id = v_owner_id) THEN
    INSERT INTO jobs(title, description, city, homeowner_id, status)
    VALUES ('Bathroom Tiling', 'Complete tiling of main bathroom — floor and walls.', 'karachi', v_owner_id, 'open');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'House Painting' AND homeowner_id = v_owner_id) THEN
    INSERT INTO jobs(title, description, city, homeowner_id, status)
    VALUES ('House Painting', 'Full exterior paint job, 3 floors. Paint provided by owner.', 'karachi', v_owner_id, 'open');
  END IF;

END $$;
