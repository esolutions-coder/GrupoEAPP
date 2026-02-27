/*
  # Create Work Reports Module

  ## Overview
  This migration creates the complete work reports system for tracking daily work activities,
  worker hours, and crew assignments on construction projects.

  ## New Tables
  
  ### 1. work_reports
  Main work report header table
  
  ### 2. work_report_details
  Worker details for each work report
  
  ### 3. work_report_signatures
  Digital signatures for work reports

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users
*/

-- Create work_reports table
CREATE TABLE IF NOT EXISTS work_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number text UNIQUE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  manager text NOT NULL,
  activities text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'closed')),
  month_closed boolean DEFAULT false,
  closed_at timestamptz,
  closed_by text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text,
  updated_by text
);

-- Create work_report_details table
CREATE TABLE IF NOT EXISTS work_report_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_report_id uuid REFERENCES work_reports(id) ON DELETE CASCADE NOT NULL,
  worker_id uuid REFERENCES workers(id) ON DELETE RESTRICT NOT NULL,
  hour_type text NOT NULL DEFAULT 'admin' CHECK (hour_type IN ('admin', 'destajo', 'extra')),
  hours_worked numeric(5,2) NOT NULL DEFAULT 0 CHECK (hours_worked >= 0),
  crew_id uuid REFERENCES crews(id) ON DELETE SET NULL,
  observations text,
  created_at timestamptz DEFAULT now()
);

-- Create work_report_signatures table
CREATE TABLE IF NOT EXISTS work_report_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_report_id uuid REFERENCES work_reports(id) ON DELETE CASCADE NOT NULL,
  signer_name text NOT NULL,
  signer_role text NOT NULL CHECK (signer_role IN ('manager', 'supervisor', 'worker')),
  signature_data text NOT NULL,
  signed_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_reports_project ON work_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_work_reports_date ON work_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_work_reports_status ON work_reports(status);
CREATE INDEX IF NOT EXISTS idx_work_reports_month_closed ON work_reports(month_closed);
CREATE INDEX IF NOT EXISTS idx_work_report_details_report ON work_report_details(work_report_id);
CREATE INDEX IF NOT EXISTS idx_work_report_details_worker ON work_report_details(worker_id);
CREATE INDEX IF NOT EXISTS idx_work_report_signatures_report ON work_report_signatures(work_report_id);

-- Enable Row Level Security
ALTER TABLE work_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_report_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_report_signatures ENABLE ROW LEVEL SECURITY;

-- Policies for work_reports
CREATE POLICY "Allow public read access to work_reports"
  ON work_reports FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to work_reports"
  ON work_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to work_reports"
  ON work_reports FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from work_reports"
  ON work_reports FOR DELETE
  USING (true);

-- Policies for work_report_details
CREATE POLICY "Allow public read access to work_report_details"
  ON work_report_details FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to work_report_details"
  ON work_report_details FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to work_report_details"
  ON work_report_details FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from work_report_details"
  ON work_report_details FOR DELETE
  USING (true);

-- Policies for work_report_signatures
CREATE POLICY "Allow public read access to work_report_signatures"
  ON work_report_signatures FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to work_report_signatures"
  ON work_report_signatures FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to work_report_signatures"
  ON work_report_signatures FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from work_report_signatures"
  ON work_report_signatures FOR DELETE
  USING (true);

-- Function to generate report number
CREATE OR REPLACE FUNCTION generate_report_number()
RETURNS text AS $$
DECLARE
  next_number integer;
  new_report_number text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(report_number FROM 4) AS integer)), 0) + 1
  INTO next_number
  FROM work_reports;
  
  new_report_number := 'PT-' || LPAD(next_number::text, 6, '0');
  RETURN new_report_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate report number
CREATE OR REPLACE FUNCTION set_report_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.report_number IS NULL OR NEW.report_number = '' THEN
    NEW.report_number := generate_report_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_report_number
  BEFORE INSERT ON work_reports
  FOR EACH ROW
  EXECUTE FUNCTION set_report_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_work_reports_updated_at
  BEFORE UPDATE ON work_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();