/*
  # Create Certifications Module

  ## Overview
  Complete certifications module for construction projects with work breakdown,
  economic control, signatures, and full traceability.

  ## Tables Created

  ### 1. certifications
  Main certification records
  - `id` (uuid, primary key)
  - `project_id` (uuid) - Reference to projects
  - `certification_number` (text) - Unique certification number
  - `certification_code` (text) - Internal code
  - `contractor` (text) - Contractor or executing company
  - `issue_date` (date) - Issue date
  - `period_start` (date) - Period start date
  - `period_end` (date) - Period end date
  - `status` (text) - draft, validated, certified, rejected
  - `total_amount` (numeric) - Total certified amount
  - `accumulated_amount` (numeric) - Accumulated to date
  - `retention_percentage` (numeric) - Retention percentage
  - `retention_amount` (numeric) - Retention amount
  - `discount_amount` (numeric) - Discounts applied
  - `net_amount` (numeric) - Net amount to pay
  - `notes` (text) - General notes
  - `created_by` (text) - User who created
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. certification_items
  Line items in each certification
  - `id` (uuid, primary key)
  - `certification_id` (uuid) - Reference to certifications
  - `measurement_item_id` (uuid) - Reference to measurement_items
  - `item_code` (text) - Item code
  - `description` (text) - Item description
  - `unit_of_measure` (text) - Unit of measure
  - `unit_price` (numeric) - Unit price
  - `budgeted_quantity` (numeric) - Total budgeted quantity
  - `previous_quantity` (numeric) - Previous accumulated quantity
  - `current_quantity` (numeric) - Current period quantity
  - `accumulated_quantity` (numeric) - Total accumulated quantity
  - `percentage_executed` (numeric) - Execution percentage
  - `previous_amount` (numeric) - Previous accumulated amount
  - `current_amount` (numeric) - Current period amount
  - `accumulated_amount` (numeric) - Total accumulated amount
  - `observations` (text) - Item observations
  - `created_at` (timestamptz)

  ### 3. certification_signatures
  Signatures and approvals
  - `id` (uuid, primary key)
  - `certification_id` (uuid) - Reference to certifications
  - `role` (text) - site_manager, technician, client, director
  - `signer_name` (text) - Name of signer
  - `signer_email` (text) - Email of signer
  - `signature_date` (timestamptz) - Date of signature
  - `status` (text) - pending, signed, rejected
  - `rejection_reason` (text) - Reason if rejected
  - `signature_data` (text) - Digital signature data
  - `created_at` (timestamptz)

  ### 4. certification_documents
  Documents attached to certifications
  - `id` (uuid, primary key)
  - `certification_id` (uuid) - Reference to certifications
  - `document_type` (text) - plan, report, photo, other
  - `document_name` (text) - Document name
  - `document_url` (text) - Document URL
  - `file_size` (integer) - File size in bytes
  - `uploaded_by` (text) - Who uploaded
  - `uploaded_at` (timestamptz)

  ### 5. certification_history
  Audit trail for certifications
  - `id` (uuid, primary key)
  - `certification_id` (uuid) - Reference to certifications
  - `action` (text) - created, updated, validated, certified, rejected
  - `changed_by` (text) - Who made the change
  - `changes` (text) - Description of changes
  - `changed_at` (timestamptz)

  ## Views

  ### certification_summary
  Summary of certifications by project

  ### certification_economic_control
  Economic control and deviations

  ## Security
  - RLS enabled with public access for testing
*/

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  certification_number text NOT NULL,
  certification_code text,
  contractor text NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'certified', 'rejected')),
  total_amount numeric(12,2) DEFAULT 0,
  accumulated_amount numeric(12,2) DEFAULT 0,
  retention_percentage numeric(5,2) DEFAULT 0,
  retention_amount numeric(12,2) DEFAULT 0,
  discount_amount numeric(12,2) DEFAULT 0,
  net_amount numeric(12,2) DEFAULT 0,
  notes text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, certification_number)
);

-- Create certification_items table
CREATE TABLE IF NOT EXISTS certification_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid REFERENCES certifications(id) ON DELETE CASCADE NOT NULL,
  measurement_item_id uuid REFERENCES measurement_items(id) ON DELETE SET NULL,
  item_code text NOT NULL,
  description text NOT NULL,
  unit_of_measure text NOT NULL DEFAULT 'ud',
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  budgeted_quantity numeric(12,3) DEFAULT 0,
  previous_quantity numeric(12,3) DEFAULT 0,
  current_quantity numeric(12,3) NOT NULL DEFAULT 0,
  accumulated_quantity numeric(12,3) DEFAULT 0,
  percentage_executed numeric(5,2) DEFAULT 0,
  previous_amount numeric(12,2) DEFAULT 0,
  current_amount numeric(12,2) DEFAULT 0,
  accumulated_amount numeric(12,2) DEFAULT 0,
  observations text,
  created_at timestamptz DEFAULT now()
);

-- Create certification_signatures table
CREATE TABLE IF NOT EXISTS certification_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid REFERENCES certifications(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('site_manager', 'technician', 'client', 'director')),
  signer_name text NOT NULL,
  signer_email text,
  signature_date timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'rejected')),
  rejection_reason text,
  signature_data text,
  created_at timestamptz DEFAULT now()
);

-- Create certification_documents table
CREATE TABLE IF NOT EXISTS certification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid REFERENCES certifications(id) ON DELETE CASCADE NOT NULL,
  document_type text DEFAULT 'other' CHECK (document_type IN ('plan', 'report', 'photo', 'other')),
  document_name text NOT NULL,
  document_url text NOT NULL,
  file_size integer DEFAULT 0,
  uploaded_by text,
  uploaded_at timestamptz DEFAULT now()
);

-- Create certification_history table
CREATE TABLE IF NOT EXISTS certification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid REFERENCES certifications(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'validated', 'certified', 'rejected', 'duplicated')),
  changed_by text,
  changes text,
  changed_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_certifications_project ON certifications(project_id);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON certifications(status);
CREATE INDEX IF NOT EXISTS idx_certifications_issue_date ON certifications(issue_date);
CREATE INDEX IF NOT EXISTS idx_certification_items_certification ON certification_items(certification_id);
CREATE INDEX IF NOT EXISTS idx_certification_items_measurement ON certification_items(measurement_item_id);
CREATE INDEX IF NOT EXISTS idx_certification_signatures_certification ON certification_signatures(certification_id);
CREATE INDEX IF NOT EXISTS idx_certification_signatures_status ON certification_signatures(status);
CREATE INDEX IF NOT EXISTS idx_certification_documents_certification ON certification_documents(certification_id);
CREATE INDEX IF NOT EXISTS idx_certification_history_certification ON certification_history(certification_id);

-- Enable RLS
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_history ENABLE ROW LEVEL SECURITY;

-- Policies for certifications
CREATE POLICY "Allow public read access to certifications"
  ON certifications FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to certifications"
  ON certifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to certifications"
  ON certifications FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from certifications"
  ON certifications FOR DELETE
  USING (true);

-- Policies for certification_items
CREATE POLICY "Allow public read access to certification_items"
  ON certification_items FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to certification_items"
  ON certification_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to certification_items"
  ON certification_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from certification_items"
  ON certification_items FOR DELETE
  USING (true);

-- Policies for certification_signatures
CREATE POLICY "Allow public read access to certification_signatures"
  ON certification_signatures FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to certification_signatures"
  ON certification_signatures FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to certification_signatures"
  ON certification_signatures FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from certification_signatures"
  ON certification_signatures FOR DELETE
  USING (true);

-- Policies for certification_documents
CREATE POLICY "Allow public read access to certification_documents"
  ON certification_documents FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to certification_documents"
  ON certification_documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to certification_documents"
  ON certification_documents FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from certification_documents"
  ON certification_documents FOR DELETE
  USING (true);

-- Policies for certification_history
CREATE POLICY "Allow public read access to certification_history"
  ON certification_history FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to certification_history"
  ON certification_history FOR INSERT
  WITH CHECK (true);

-- Create view for certification summary
CREATE OR REPLACE VIEW certification_summary AS
SELECT 
  c.id as certification_id,
  c.project_id,
  p.name as project_name,
  c.certification_number,
  c.certification_code,
  c.contractor,
  c.issue_date,
  c.period_start,
  c.period_end,
  c.status,
  c.total_amount,
  c.accumulated_amount,
  c.retention_amount,
  c.discount_amount,
  c.net_amount,
  COUNT(DISTINCT ci.id) as total_items,
  COUNT(DISTINCT CASE WHEN cs.status = 'signed' THEN cs.id END) as signed_count,
  COUNT(DISTINCT cs.id) as total_signatures_required,
  CASE 
    WHEN COUNT(DISTINCT cs.id) > 0 AND COUNT(DISTINCT CASE WHEN cs.status = 'signed' THEN cs.id END) = COUNT(DISTINCT cs.id) 
    THEN true 
    ELSE false 
  END as all_signed,
  c.created_at,
  c.updated_at
FROM certifications c
LEFT JOIN projects p ON c.project_id = p.id
LEFT JOIN certification_items ci ON c.id = ci.certification_id
LEFT JOIN certification_signatures cs ON c.id = cs.certification_id
GROUP BY 
  c.id, c.project_id, p.name, c.certification_number, c.certification_code,
  c.contractor, c.issue_date, c.period_start, c.period_end, c.status,
  c.total_amount, c.accumulated_amount, c.retention_amount, 
  c.discount_amount, c.net_amount, c.created_at, c.updated_at;

-- Create view for economic control
CREATE OR REPLACE VIEW certification_economic_control AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  p.total_budget,
  COUNT(DISTINCT c.id) as total_certifications,
  SUM(c.total_amount) as total_certified,
  MAX(c.accumulated_amount) as accumulated_certified,
  SUM(c.retention_amount) as total_retention,
  SUM(c.discount_amount) as total_discounts,
  SUM(c.net_amount) as total_net_amount,
  p.total_budget - COALESCE(MAX(c.accumulated_amount), 0) as pending_to_certify,
  CASE 
    WHEN p.total_budget > 0 THEN (COALESCE(MAX(c.accumulated_amount), 0) / p.total_budget * 100)
    ELSE 0 
  END as percentage_certified
FROM projects p
LEFT JOIN certifications c ON p.id = c.project_id AND c.status IN ('validated', 'certified')
GROUP BY p.id, p.name, p.total_budget;

-- Create trigger function to update certification totals
CREATE OR REPLACE FUNCTION update_certification_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE certifications
  SET 
    total_amount = (
      SELECT COALESCE(SUM(current_amount), 0)
      FROM certification_items
      WHERE certification_id = NEW.certification_id
    ),
    accumulated_amount = (
      SELECT COALESCE(SUM(accumulated_amount), 0)
      FROM certification_items
      WHERE certification_id = NEW.certification_id
    ),
    updated_at = now()
  WHERE id = NEW.certification_id;
  
  UPDATE certifications
  SET 
    retention_amount = total_amount * (retention_percentage / 100),
    net_amount = total_amount - (total_amount * (retention_percentage / 100)) - discount_amount
  WHERE id = NEW.certification_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for certification items
DROP TRIGGER IF EXISTS trigger_update_certification_totals ON certification_items;
CREATE TRIGGER trigger_update_certification_totals
  AFTER INSERT OR UPDATE ON certification_items
  FOR EACH ROW
  EXECUTE FUNCTION update_certification_totals();

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_certifications_updated_at ON certifications;
CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();