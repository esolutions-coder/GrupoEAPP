/*
  # Enhance Settlements Module with Work Reports Integration

  ## Overview
  Enhances the settlements module to integrate with work reports for automatic
  calculation of hours, improved incident tracking, and comprehensive reporting.

  ## Changes
  
  ### 1. New Columns in payroll_settlements
  - `auto_calculated` (boolean) - Whether settlement was auto-calculated from work reports
  - `work_reports_period_start` (date) - Start date for work reports period
  - `work_reports_period_end` (date) - End date for work reports period
  
  ### 2. New Table: settlement_work_report_links
  Links settlements to specific work reports used in calculation
  - `id` (uuid, primary key)
  - `settlement_id` (uuid) - Reference to payroll_settlements
  - `work_report_id` (uuid) - Reference to work_reports
  - `hours_counted` (numeric) - Hours from this work report
  - `created_at` (timestamptz)

  ### 3. Enhanced settlement_incidents
  - Added `justification_document` (text) - URL or path to justification document
  - Added `approved_by` (text) - Who approved the incident
  - Added `approval_date` (timestamptz) - When was it approved
  
  ### 4. New View: settlement_summary_by_project
  Provides aggregated data by project for reporting

  ## Security
  - RLS enabled with public access for testing
*/

-- Add new columns to payroll_settlements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payroll_settlements' AND column_name = 'auto_calculated'
  ) THEN
    ALTER TABLE payroll_settlements ADD COLUMN auto_calculated boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payroll_settlements' AND column_name = 'work_reports_period_start'
  ) THEN
    ALTER TABLE payroll_settlements ADD COLUMN work_reports_period_start date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payroll_settlements' AND column_name = 'work_reports_period_end'
  ) THEN
    ALTER TABLE payroll_settlements ADD COLUMN work_reports_period_end date;
  END IF;
END $$;

-- Create settlement_work_report_links table
CREATE TABLE IF NOT EXISTS settlement_work_report_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id uuid REFERENCES payroll_settlements(id) ON DELETE CASCADE NOT NULL,
  work_report_id uuid REFERENCES work_reports(id) ON DELETE CASCADE NOT NULL,
  hours_counted numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(settlement_id, work_report_id)
);

-- Add new columns to settlement_incidents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settlement_incidents' AND column_name = 'justification_document'
  ) THEN
    ALTER TABLE settlement_incidents ADD COLUMN justification_document text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settlement_incidents' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE settlement_incidents ADD COLUMN approved_by text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settlement_incidents' AND column_name = 'approval_date'
  ) THEN
    ALTER TABLE settlement_incidents ADD COLUMN approval_date timestamptz;
  END IF;
END $$;

-- Create index for work report links
CREATE INDEX IF NOT EXISTS idx_settlement_work_report_links_settlement 
  ON settlement_work_report_links(settlement_id);
CREATE INDEX IF NOT EXISTS idx_settlement_work_report_links_work_report 
  ON settlement_work_report_links(work_report_id);

-- Enable RLS on new table
ALTER TABLE settlement_work_report_links ENABLE ROW LEVEL SECURITY;

-- Policies for settlement_work_report_links
CREATE POLICY "Allow public read access to settlement_work_report_links"
  ON settlement_work_report_links FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to settlement_work_report_links"
  ON settlement_work_report_links FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to settlement_work_report_links"
  ON settlement_work_report_links FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from settlement_work_report_links"
  ON settlement_work_report_links FOR DELETE
  USING (true);

-- Create view for settlement summary by project
CREATE OR REPLACE VIEW settlement_summary_by_project AS
SELECT 
  ps.project_id,
  p.name as project_name,
  ps.period_month,
  ps.period_year,
  COUNT(ps.id) as total_settlements,
  SUM(ps.gross_amount) as total_gross,
  SUM(ps.total_deductions) as total_deductions,
  SUM(ps.net_amount) as total_net,
  SUM(ps.total_hours_worked) as total_hours
FROM payroll_settlements ps
LEFT JOIN projects p ON ps.project_id = p.id
GROUP BY ps.project_id, p.name, ps.period_month, ps.period_year;

-- Create view for detailed settlement report
CREATE OR REPLACE VIEW settlement_detailed_report AS
SELECT 
  ps.id as settlement_id,
  ps.settlement_code,
  w.first_name || ' ' || w.last_name as worker_name,
  w.worker_code,
  p.name as project_name,
  p.code as project_code,
  ps.period_month,
  ps.period_year,
  ps.base_salary,
  ps.total_hours_worked,
  ps.gross_amount,
  ps.total_deductions,
  ps.total_additional_income,
  ps.net_amount,
  ps.status,
  ps.auto_calculated,
  ps.created_at,
  ps.approved_at,
  (SELECT COUNT(*) FROM settlement_hours sh WHERE sh.settlement_id = ps.id) as hours_entries,
  (SELECT COUNT(*) FROM settlement_incidents si WHERE si.settlement_id = ps.id) as incidents_count,
  (SELECT COUNT(*) FROM settlement_deductions sd WHERE sd.settlement_id = ps.id) as deductions_count,
  (SELECT COUNT(*) FROM settlement_additional_income sai WHERE sai.settlement_id = ps.id) as income_entries
FROM payroll_settlements ps
LEFT JOIN workers w ON ps.worker_id = w.id
LEFT JOIN projects p ON ps.project_id = p.id;