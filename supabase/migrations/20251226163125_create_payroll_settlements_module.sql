/*
  # Create Payroll Settlements Module

  ## Overview
  Creates comprehensive tables for managing worker payroll settlements with hours,
  incidents, deductions, and additional income.

  ## New Tables
  
  ### payroll_settlements
  - `id` (uuid, primary key) - Unique identifier
  - `settlement_code` (text) - Settlement code (e.g., LIQ-2024-01-001)
  - `worker_id` (uuid) - Reference to workers table
  - `project_id` (uuid) - Reference to projects table (optional)
  - `period_month` (integer) - Month number (1-12)
  - `period_year` (integer) - Year
  - `status` (text) - Status: draft, calculated, approved, paid
  - `base_salary` (numeric) - Base salary amount
  - `total_hours_worked` (numeric) - Total hours worked
  - `gross_amount` (numeric) - Gross amount before deductions
  - `total_deductions` (numeric) - Total deductions
  - `total_additional_income` (numeric) - Total additional income
  - `net_amount` (numeric) - Final net amount
  - `payment_date` (date) - When payment was made
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `created_by` (text) - User who created
  - `approved_by` (text) - User who approved
  - `approved_at` (timestamptz) - Approval timestamp

  ### settlement_hours
  - `id` (uuid, primary key) - Unique identifier
  - `settlement_id` (uuid) - Reference to payroll_settlements
  - `hour_type` (text) - Type: normal, overtime, night, holiday
  - `hours` (numeric) - Number of hours
  - `rate` (numeric) - Rate per hour
  - `amount` (numeric) - Total amount (hours * rate)
  - `description` (text) - Description
  - `created_at` (timestamptz) - Creation timestamp

  ### settlement_incidents
  - `id` (uuid, primary key) - Unique identifier
  - `settlement_id` (uuid) - Reference to payroll_settlements
  - `incident_type` (text) - Type: absence, permission, sick_leave, vacation
  - `incident_date` (date) - Date of incident
  - `days` (numeric) - Number of days
  - `hours` (numeric) - Number of hours
  - `affects_payment` (boolean) - Whether it affects payment
  - `discount_amount` (numeric) - Discount amount if applicable
  - `description` (text) - Description
  - `created_at` (timestamptz) - Creation timestamp

  ### settlement_deductions
  - `id` (uuid, primary key) - Unique identifier
  - `settlement_id` (uuid) - Reference to payroll_settlements
  - `deduction_type` (text) - Type: irpf, garnishment, sanction, advance
  - `amount` (numeric) - Deduction amount
  - `percentage` (numeric) - Percentage if applicable
  - `description` (text) - Description
  - `reference` (text) - Reference number
  - `created_at` (timestamptz) - Creation timestamp

  ### settlement_additional_income
  - `id` (uuid, primary key) - Unique identifier
  - `settlement_id` (uuid) - Reference to payroll_settlements
  - `income_type` (text) - Type: per_diem, bonus, award, other
  - `amount` (numeric) - Income amount
  - `description` (text) - Description
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - RLS enabled with public access for testing
*/

-- Create payroll_settlements table
CREATE TABLE IF NOT EXISTS payroll_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_code text UNIQUE NOT NULL,
  worker_id uuid REFERENCES workers(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  period_month integer NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year integer NOT NULL CHECK (period_year >= 2020),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'approved', 'paid')),
  base_salary numeric(10,2) DEFAULT 0,
  total_hours_worked numeric(10,2) DEFAULT 0,
  gross_amount numeric(10,2) DEFAULT 0,
  total_deductions numeric(10,2) DEFAULT 0,
  total_additional_income numeric(10,2) DEFAULT 0,
  net_amount numeric(10,2) DEFAULT 0,
  payment_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text,
  approved_by text,
  approved_at timestamptz,
  UNIQUE(worker_id, period_month, period_year)
);

-- Create settlement_hours table
CREATE TABLE IF NOT EXISTS settlement_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id uuid REFERENCES payroll_settlements(id) ON DELETE CASCADE NOT NULL,
  hour_type text NOT NULL CHECK (hour_type IN ('normal', 'overtime', 'night', 'holiday')),
  hours numeric(10,2) NOT NULL DEFAULT 0,
  rate numeric(10,2) NOT NULL DEFAULT 0,
  amount numeric(10,2) GENERATED ALWAYS AS (hours * rate) STORED,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create settlement_incidents table
CREATE TABLE IF NOT EXISTS settlement_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id uuid REFERENCES payroll_settlements(id) ON DELETE CASCADE NOT NULL,
  incident_type text NOT NULL CHECK (incident_type IN ('absence', 'permission', 'sick_leave', 'vacation')),
  incident_date date NOT NULL,
  days numeric(10,2) DEFAULT 0,
  hours numeric(10,2) DEFAULT 0,
  affects_payment boolean DEFAULT false,
  discount_amount numeric(10,2) DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create settlement_deductions table
CREATE TABLE IF NOT EXISTS settlement_deductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id uuid REFERENCES payroll_settlements(id) ON DELETE CASCADE NOT NULL,
  deduction_type text NOT NULL CHECK (deduction_type IN ('irpf', 'garnishment', 'sanction', 'advance', 'social_security', 'other')),
  amount numeric(10,2) NOT NULL DEFAULT 0,
  percentage numeric(5,2) DEFAULT 0,
  description text,
  reference text,
  created_at timestamptz DEFAULT now()
);

-- Create settlement_additional_income table
CREATE TABLE IF NOT EXISTS settlement_additional_income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id uuid REFERENCES payroll_settlements(id) ON DELETE CASCADE NOT NULL,
  income_type text NOT NULL CHECK (income_type IN ('per_diem', 'bonus', 'award', 'transportation', 'other')),
  amount numeric(10,2) NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_settlements_worker ON payroll_settlements(worker_id);
CREATE INDEX IF NOT EXISTS idx_settlements_project ON payroll_settlements(project_id);
CREATE INDEX IF NOT EXISTS idx_settlements_period ON payroll_settlements(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON payroll_settlements(status);
CREATE INDEX IF NOT EXISTS idx_settlement_hours_settlement ON settlement_hours(settlement_id);
CREATE INDEX IF NOT EXISTS idx_settlement_incidents_settlement ON settlement_incidents(settlement_id);
CREATE INDEX IF NOT EXISTS idx_settlement_deductions_settlement ON settlement_deductions(settlement_id);
CREATE INDEX IF NOT EXISTS idx_settlement_income_settlement ON settlement_additional_income(settlement_id);

-- Enable RLS
ALTER TABLE payroll_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_additional_income ENABLE ROW LEVEL SECURITY;

-- Policies for payroll_settlements
CREATE POLICY "Allow public read access to payroll_settlements"
  ON payroll_settlements FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to payroll_settlements"
  ON payroll_settlements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to payroll_settlements"
  ON payroll_settlements FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from payroll_settlements"
  ON payroll_settlements FOR DELETE
  USING (true);

-- Policies for settlement_hours
CREATE POLICY "Allow public read access to settlement_hours"
  ON settlement_hours FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to settlement_hours"
  ON settlement_hours FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to settlement_hours"
  ON settlement_hours FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from settlement_hours"
  ON settlement_hours FOR DELETE
  USING (true);

-- Policies for settlement_incidents
CREATE POLICY "Allow public read access to settlement_incidents"
  ON settlement_incidents FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to settlement_incidents"
  ON settlement_incidents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to settlement_incidents"
  ON settlement_incidents FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from settlement_incidents"
  ON settlement_incidents FOR DELETE
  USING (true);

-- Policies for settlement_deductions
CREATE POLICY "Allow public read access to settlement_deductions"
  ON settlement_deductions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to settlement_deductions"
  ON settlement_deductions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to settlement_deductions"
  ON settlement_deductions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from settlement_deductions"
  ON settlement_deductions FOR DELETE
  USING (true);

-- Policies for settlement_additional_income
CREATE POLICY "Allow public read access to settlement_additional_income"
  ON settlement_additional_income FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to settlement_additional_income"
  ON settlement_additional_income FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to settlement_additional_income"
  ON settlement_additional_income FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from settlement_additional_income"
  ON settlement_additional_income FOR DELETE
  USING (true);

-- Trigger to update updated_at timestamp
CREATE TRIGGER trigger_update_payroll_settlements_updated_at
  BEFORE UPDATE ON payroll_settlements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();