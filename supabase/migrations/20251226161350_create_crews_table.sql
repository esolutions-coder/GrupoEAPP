/*
  # Create Crews Table

  ## Overview
  Creates the crews (cuadrillas) table for managing worker teams.

  ## New Tables
  
  ### crews
  - `id` (uuid, primary key) - Unique identifier
  - `code` (text, unique) - Crew code
  - `name` (text) - Crew name
  - `leader_id` (uuid) - Reference to workers table (crew leader)
  - `status` (text) - Status: active, inactive
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled with public access for testing
*/

-- Create crews table
CREATE TABLE IF NOT EXISTS crews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  leader_id uuid REFERENCES workers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_crews_status ON crews(status);

-- Enable RLS
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;

-- Policies for crews
CREATE POLICY "Allow public read access to crews"
  ON crews FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to crews"
  ON crews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to crews"
  ON crews FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from crews"
  ON crews FOR DELETE
  USING (true);