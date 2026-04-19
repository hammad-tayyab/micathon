
/*
  # Nighabaan Micro-Escrow Platform — Initial Schema

  ## Overview
  Full schema for the Nighabaan MVP: a trust-based escrow platform for
  the Pakistani informal labor market.

  ## New Tables
  1. `users` — App participants with phone-based identity and PKR wallet balances
     - id, phone (unique), name, role (homeowner | worker), balance_pkr
  2. `jobs` — Escrow jobs with lifecycle statuses
     - id, title, description, total_amount, homeowner_id, worker_id,
       status (active | funds_secured | completed | disputed),
       proof_note, created_at
  3. `transactions` — Immutable ledger of all fund movements
     - id, job_id, user_id, amount, type (lock | release | fee), created_at

  ## Security
  - RLS enabled on all tables
  - MVP uses anon-role permissive policies (no Supabase Auth)
  - NOTE: Production deployment must replace with auth.uid()-scoped policies

  ## Seed Data
  - Homeowner: Asad (03001234567), balance 100,000 PKR
  - Worker: Rafiq (03009876543), balance 0 PKR
  - Sample job: "Bathroom Tiling", status funds_secured, amount 15,000 PKR

  ## RPC Functions
  - lock_funds(p_job_id) — atomic homeowner deduction + status update
  - release_funds(p_job_id) — atomic worker credit + 1% fee + completion
  - request_release(p_job_id, p_note) — worker submits proof note
*/

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'worker' CHECK (role IN ('homeowner', 'worker')),
  balance_pkr numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  homeowner_id uuid REFERENCES users(id),
  worker_id uuid REFERENCES users(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'funds_secured', 'release_requested', 'completed', 'disputed')),
  proof_note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id),
  user_id uuid REFERENCES users(id),
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('lock', 'release', 'fee')),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_jobs_homeowner ON jobs(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_jobs_worker ON jobs(worker_id);
CREATE INDEX IF NOT EXISTS idx_transactions_job ON transactions(job_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- NOTE: MVP uses permissive anon policies for mock-auth demo.
-- Production must use auth.uid() scoped policies.
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_users" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_users" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_users" ON users FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_select_jobs" ON jobs FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_jobs" ON jobs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_jobs" ON jobs FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_select_transactions" ON transactions FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT TO anon WITH CHECK (true);

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION lock_funds(p_job_id uuid, p_homeowner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_amount numeric;
  v_total_charge numeric;
  v_balance numeric;
BEGIN
  SELECT total_amount INTO v_amount FROM jobs WHERE id = p_job_id AND status = 'active';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found or not in active status';
  END IF;

  v_total_charge := v_amount * 1.01;

  SELECT balance_pkr INTO v_balance FROM users WHERE id = p_homeowner_id;
  IF v_balance < v_total_charge THEN
    RAISE EXCEPTION 'Insufficient balance. Need % PKR', ROUND(v_total_charge, 2);
  END IF;

  UPDATE users SET balance_pkr = balance_pkr - v_total_charge WHERE id = p_homeowner_id;
  UPDATE jobs SET status = 'funds_secured' WHERE id = p_job_id;
  INSERT INTO transactions(job_id, user_id, amount, type) VALUES (p_job_id, p_homeowner_id, v_total_charge, 'lock');
END;
$$;

CREATE OR REPLACE FUNCTION request_release(p_job_id uuid, p_worker_id uuid, p_note text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE jobs
  SET status = 'release_requested', proof_note = p_note
  WHERE id = p_job_id AND worker_id = p_worker_id AND status = 'funds_secured';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found, not assigned to this worker, or not in funds_secured status';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION release_funds(p_job_id uuid, p_homeowner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_amount numeric;
  v_worker_id uuid;
  v_worker_receives numeric;
  v_fee numeric;
BEGIN
  SELECT total_amount, worker_id INTO v_amount, v_worker_id
  FROM jobs
  WHERE id = p_job_id AND homeowner_id = p_homeowner_id AND status IN ('funds_secured', 'release_requested');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found or cannot be released';
  END IF;

  v_fee := v_amount * 0.01;
  v_worker_receives := v_amount - v_fee;

  UPDATE users SET balance_pkr = balance_pkr + v_worker_receives WHERE id = v_worker_id;
  UPDATE jobs SET status = 'completed' WHERE id = p_job_id;

  INSERT INTO transactions(job_id, user_id, amount, type) VALUES (p_job_id, v_worker_id, v_worker_receives, 'release');
  INSERT INTO transactions(job_id, user_id, amount, type) VALUES (p_job_id, v_worker_id, v_fee, 'fee');
END;
$$;

-- ============================================================
-- SEED DATA
-- ============================================================

DO $$
DECLARE
  v_homeowner_id uuid;
  v_worker_id uuid;
  v_job_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE phone = '03001234567') THEN
    INSERT INTO users(phone, name, role, balance_pkr)
    VALUES ('03001234567', 'Asad Khan', 'homeowner', 85000)
    RETURNING id INTO v_homeowner_id;
  ELSE
    SELECT id INTO v_homeowner_id FROM users WHERE phone = '03001234567';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE phone = '03009876543') THEN
    INSERT INTO users(phone, name, role, balance_pkr)
    VALUES ('03009876543', 'Rafiq Ahmed', 'worker', 0)
    RETURNING id INTO v_worker_id;
  ELSE
    SELECT id INTO v_worker_id FROM users WHERE phone = '03009876543';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Bathroom Tiling' AND homeowner_id = v_homeowner_id) THEN
    INSERT INTO jobs(title, description, total_amount, homeowner_id, worker_id, status)
    VALUES (
      'Bathroom Tiling',
      'Complete tiling of the main bathroom — floor and walls. Materials provided by homeowner.',
      15000,
      v_homeowner_id,
      v_worker_id,
      'funds_secured'
    )
    RETURNING id INTO v_job_id;

    INSERT INTO transactions(job_id, user_id, amount, type)
    VALUES (v_job_id, v_homeowner_id, 15150, 'lock');
  END IF;
END $$;
