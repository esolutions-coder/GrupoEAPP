/*
  # Create Crew Members Table

  ## Overview
  Creates the crew_members table for managing the many-to-many relationship
  between crews and workers.

  ## New Tables
  
  ### crew_members
  - `id` (uuid, primary key) - Unique identifier
  - `crew_id` (uuid) - Reference to crews table
  - `worker_id` (uuid) - Reference to workers table
  - `joined_date` (date) - When worker joined the crew
  - `is_leader` (boolean) - Whether this worker is the crew leader
  - `status` (text) - Status: active, inactive
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled with public access for testing
*/

-- Create crew_members table
CREATE TABLE IF NOT EXISTS crew_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid REFERENCES crews(id) ON DELETE CASCADE NOT NULL,
  worker_id uuid REFERENCES workers(id) ON DELETE CASCADE NOT NULL,
  joined_date date DEFAULT CURRENT_DATE,
  is_leader boolean DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(crew_id, worker_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_crew_members_crew ON crew_members(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_worker ON crew_members(worker_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_status ON crew_members(status);

-- Enable RLS
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;

-- Policies for crew_members
CREATE POLICY "Allow public read access to crew_members"
  ON crew_members FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to crew_members"
  ON crew_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to crew_members"
  ON crew_members FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from crew_members"
  ON crew_members FOR DELETE
  USING (true);

-- Trigger to update updated_at timestamp
CREATE TRIGGER trigger_update_crew_members_updated_at
  BEFORE UPDATE ON crew_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();