/*
# Create cutoff_records and colleges tables for MHT-CET 2026 Forecasting

1. New Tables
- `colleges` — normalized college directory
  - `college_code` (text, primary key) — e.g. "1001"
  - `college_name` (text, not null) — full name
  - `city` (text, not null) — normalized city
  - `created_at` (timestamptz, default now)
- `cutoff_records` — historical admission cutoff data
  - `id` (uuid, primary key, default gen_random_uuid)
  - `year` (integer, not null) — e.g. 2022, 2023, 2024, 2025
  - `college_code` (text, not null, FK to colleges)
  - `branch` (text, not null) — e.g. "Computer Engineering"
  - `seat_type` (text, not null) — e.g. "GOPENS", "AI"
  - `cutoff_percentile` (numeric, not null) — 0-100
  - `created_at` (timestamptz, default now)

2. Indexes
- `idx_cutoff_year` on cutoff_records(year) for fast year filtering
- `idx_cutoff_college_branch` on cutoff_records(college_code, branch) for forecasting grouping
- `idx_cutoff_seat_type` on cutoff_records(seat_type) for category filtering

3. Security (single-tenant, no auth required)
- Enable RLS on both tables
- Allow anon + authenticated full CRUD so the frontend can read/write freely
*/

CREATE TABLE IF NOT EXISTS colleges (
  college_code text PRIMARY KEY,
  college_name text NOT NULL,
  city text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cutoff_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  college_code text NOT NULL REFERENCES colleges(college_code) ON DELETE CASCADE,
  branch text NOT NULL,
  seat_type text NOT NULL,
  cutoff_percentile numeric NOT NULL CHECK (cutoff_percentile >= 0 AND cutoff_percentile <= 100),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cutoff_year ON cutoff_records(year);
CREATE INDEX IF NOT EXISTS idx_cutoff_college_branch ON cutoff_records(college_code, branch);
CREATE INDEX IF NOT EXISTS idx_cutoff_seat_type ON cutoff_records(seat_type);

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE cutoff_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_colleges" ON colleges;
CREATE POLICY "anon_select_colleges" ON colleges FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_colleges" ON colleges;
CREATE POLICY "anon_insert_colleges" ON colleges FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_colleges" ON colleges;
CREATE POLICY "anon_update_colleges" ON colleges FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_colleges" ON colleges;
CREATE POLICY "anon_delete_colleges" ON colleges FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_cutoff" ON cutoff_records;
CREATE POLICY "anon_select_cutoff" ON cutoff_records FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cutoff" ON cutoff_records;
CREATE POLICY "anon_insert_cutoff" ON cutoff_records FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cutoff" ON cutoff_records;
CREATE POLICY "anon_update_cutoff" ON cutoff_records FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cutoff" ON cutoff_records;
CREATE POLICY "anon_delete_cutoff" ON cutoff_records FOR DELETE
  TO anon, authenticated USING (true);
