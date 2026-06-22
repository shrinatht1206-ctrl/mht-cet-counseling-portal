/*
# Create Student Profiles Table

1. New Tables
- `student_profiles` - stores counselor-managed student profiles for college predictions
- `id` (uuid, primary key, auto-generated)
- `name` (text, not null) - student name
- `mht_cet_percentile` (numeric, 0-100) - MHT-CET exam percentile
- `jee_percentile` (numeric, 0-100) - JEE Main exam percentile
- `home_university` (text) - home university region (SPPU, MU, BATU, etc.)
- `category` (text) - reservation category code
- `preferred_cities` (text[]) - array of preferred city names
- `preferred_branches` (text[]) - array of preferred branch names
- `seat_types` (text[]) - seat type abbreviations for filtering
- `created_at` (timestamptz) - auto timestamp

2. Security
- Enable RLS on `student_profiles`.
- Single-tenant app: allow anonymous and authenticated access to all profiles.
*/

CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mht_cet_percentile numeric(5,2) DEFAULT 0,
  jee_percentile numeric(5,2) DEFAULT 0,
  home_university text DEFAULT '',
  category text DEFAULT '',
  preferred_cities text[] DEFAULT '{}',
  preferred_branches text[] DEFAULT '{}',
  seat_types text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles" ON student_profiles;
CREATE POLICY "anon_select_profiles" ON student_profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON student_profiles;
CREATE POLICY "anon_insert_profiles" ON student_profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON student_profiles;
CREATE POLICY "anon_update_profiles" ON student_profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON student_profiles;
CREATE POLICY "anon_delete_profiles" ON student_profiles FOR DELETE
  TO anon, authenticated USING (true);
