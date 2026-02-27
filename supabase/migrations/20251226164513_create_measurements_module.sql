/*
  # Create Measurements Module

  ## Overview
  Complete measurements module for construction projects with hierarchical structure,
  budget comparison, document attachments, and change tracking.

  ## Tables Created

  ### 1. measurement_chapters
  Organizes measurements into chapters (e.g., earthworks, structure, finishes)
  - `id` (uuid, primary key)
  - `project_id` (uuid) - Reference to projects
  - `chapter_code` (text) - Unique code for chapter
  - `chapter_name` (text) - Chapter name
  - `description` (text) - Detailed description
  - `display_order` (integer) - Order for display
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. measurement_items
  Individual work units/items within chapters
  - `id` (uuid, primary key)
  - `project_id` (uuid) - Reference to projects
  - `chapter_id` (uuid) - Reference to measurement_chapters
  - `item_code` (text) - Unique code for item
  - `description` (text) - Detailed description
  - `unit_of_measure` (text) - m², m³, ud, kg, etc.
  - `budgeted_quantity` (numeric) - Planned/budgeted quantity
  - `budgeted_unit_price` (numeric) - Budgeted unit price
  - `budgeted_total` (numeric) - Total budgeted amount
  - `technical_specs` (text) - Technical specifications
  - `reference_documents` (text) - References to plans, specs
  - `notes` (text) - Additional notes
  - `status` (text) - active, completed, cancelled
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. measurement_records
  Actual measurements recorded
  - `id` (uuid, primary key)
  - `item_id` (uuid) - Reference to measurement_items
  - `record_date` (date) - Date of measurement
  - `measured_quantity` (numeric) - Quantity measured
  - `is_preliminary` (boolean) - Preliminary or definitive
  - `is_certified` (boolean) - Has been certified
  - `certification_date` (date) - Date of certification
  - `certification_number` (text) - Certification reference
  - `observations` (text) - Technical observations
  - `measured_by` (text) - Who measured
  - `approved_by` (text) - Who approved
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. measurement_documents
  Documents attached to measurements
  - `id` (uuid, primary key)
  - `item_id` (uuid) - Reference to measurement_items
  - `record_id` (uuid) - Reference to measurement_records (optional)
  - `document_type` (text) - plan, photo, report, specification
  - `document_name` (text) - Name of document
  - `document_url` (text) - URL or path to document
  - `file_size` (integer) - File size in bytes
  - `uploaded_by` (text) - Who uploaded
  - `uploaded_at` (timestamptz)

  ### 5. measurement_history
  Track changes to measurements
  - `id` (uuid, primary key)
  - `item_id` (uuid) - Reference to measurement_items
  - `record_id` (uuid) - Reference to measurement_records (optional)
  - `change_type` (text) - created, updated, deleted, certified
  - `field_changed` (text) - Which field was changed
  - `old_value` (text) - Previous value
  - `new_value` (text) - New value
  - `changed_by` (text) - Who made the change
  - `changed_at` (timestamptz)

  ## Views

  ### measurement_summary_by_chapter
  Aggregated data by chapter for reporting

  ### measurement_budget_comparison
  Comparison between budgeted and executed quantities

  ## Security
  - RLS enabled with public access for testing
*/

-- Create measurement_chapters table
CREATE TABLE IF NOT EXISTS measurement_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  chapter_code text NOT NULL,
  chapter_name text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, chapter_code)
);

-- Create measurement_items table
CREATE TABLE IF NOT EXISTS measurement_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES measurement_chapters(id) ON DELETE CASCADE NOT NULL,
  item_code text NOT NULL,
  description text NOT NULL,
  unit_of_measure text NOT NULL DEFAULT 'ud',
  budgeted_quantity numeric(12,3) DEFAULT 0,
  budgeted_unit_price numeric(10,2) DEFAULT 0,
  budgeted_total numeric(12,2) DEFAULT 0,
  technical_specs text,
  reference_documents text,
  notes text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, item_code)
);

-- Create measurement_records table
CREATE TABLE IF NOT EXISTS measurement_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES measurement_items(id) ON DELETE CASCADE NOT NULL,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  measured_quantity numeric(12,3) NOT NULL DEFAULT 0,
  is_preliminary boolean DEFAULT true,
  is_certified boolean DEFAULT false,
  certification_date date,
  certification_number text,
  observations text,
  measured_by text,
  approved_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create measurement_documents table
CREATE TABLE IF NOT EXISTS measurement_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES measurement_items(id) ON DELETE CASCADE NOT NULL,
  record_id uuid REFERENCES measurement_records(id) ON DELETE CASCADE,
  document_type text DEFAULT 'other' CHECK (document_type IN ('plan', 'photo', 'report', 'specification', 'other')),
  document_name text NOT NULL,
  document_url text NOT NULL,
  file_size integer DEFAULT 0,
  uploaded_by text,
  uploaded_at timestamptz DEFAULT now()
);

-- Create measurement_history table
CREATE TABLE IF NOT EXISTS measurement_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES measurement_items(id) ON DELETE CASCADE,
  record_id uuid REFERENCES measurement_records(id) ON DELETE CASCADE,
  change_type text NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted', 'certified')),
  field_changed text,
  old_value text,
  new_value text,
  changed_by text,
  changed_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_measurement_chapters_project ON measurement_chapters(project_id);
CREATE INDEX IF NOT EXISTS idx_measurement_items_project ON measurement_items(project_id);
CREATE INDEX IF NOT EXISTS idx_measurement_items_chapter ON measurement_items(chapter_id);
CREATE INDEX IF NOT EXISTS idx_measurement_records_item ON measurement_records(item_id);
CREATE INDEX IF NOT EXISTS idx_measurement_records_date ON measurement_records(record_date);
CREATE INDEX IF NOT EXISTS idx_measurement_documents_item ON measurement_documents(item_id);
CREATE INDEX IF NOT EXISTS idx_measurement_documents_record ON measurement_documents(record_id);
CREATE INDEX IF NOT EXISTS idx_measurement_history_item ON measurement_history(item_id);

-- Enable RLS on all tables
ALTER TABLE measurement_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_history ENABLE ROW LEVEL SECURITY;

-- Policies for measurement_chapters
CREATE POLICY "Allow public read access to measurement_chapters"
  ON measurement_chapters FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to measurement_chapters"
  ON measurement_chapters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to measurement_chapters"
  ON measurement_chapters FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from measurement_chapters"
  ON measurement_chapters FOR DELETE
  USING (true);

-- Policies for measurement_items
CREATE POLICY "Allow public read access to measurement_items"
  ON measurement_items FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to measurement_items"
  ON measurement_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to measurement_items"
  ON measurement_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from measurement_items"
  ON measurement_items FOR DELETE
  USING (true);

-- Policies for measurement_records
CREATE POLICY "Allow public read access to measurement_records"
  ON measurement_records FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to measurement_records"
  ON measurement_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to measurement_records"
  ON measurement_records FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from measurement_records"
  ON measurement_records FOR DELETE
  USING (true);

-- Policies for measurement_documents
CREATE POLICY "Allow public read access to measurement_documents"
  ON measurement_documents FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to measurement_documents"
  ON measurement_documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to measurement_documents"
  ON measurement_documents FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from measurement_documents"
  ON measurement_documents FOR DELETE
  USING (true);

-- Policies for measurement_history
CREATE POLICY "Allow public read access to measurement_history"
  ON measurement_history FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to measurement_history"
  ON measurement_history FOR INSERT
  WITH CHECK (true);

-- Create view for summary by chapter
CREATE OR REPLACE VIEW measurement_summary_by_chapter AS
SELECT 
  mc.id as chapter_id,
  mc.project_id,
  p.name as project_name,
  mc.chapter_code,
  mc.chapter_name,
  COUNT(DISTINCT mi.id) as total_items,
  SUM(mi.budgeted_total) as total_budgeted,
  SUM(mr.measured_quantity * mi.budgeted_unit_price) as total_measured,
  COUNT(DISTINCT CASE WHEN mr.is_certified THEN mr.id END) as certified_records,
  SUM(CASE WHEN mr.is_certified THEN mr.measured_quantity * mi.budgeted_unit_price ELSE 0 END) as total_certified
FROM measurement_chapters mc
LEFT JOIN projects p ON mc.project_id = p.id
LEFT JOIN measurement_items mi ON mc.id = mi.chapter_id
LEFT JOIN measurement_records mr ON mi.id = mr.item_id
GROUP BY mc.id, mc.project_id, p.name, mc.chapter_code, mc.chapter_name;

-- Create view for budget comparison
CREATE OR REPLACE VIEW measurement_budget_comparison AS
SELECT 
  mi.id as item_id,
  mi.project_id,
  p.name as project_name,
  mc.chapter_name,
  mi.item_code,
  mi.description,
  mi.unit_of_measure,
  mi.budgeted_quantity,
  mi.budgeted_unit_price,
  mi.budgeted_total,
  COALESCE(SUM(mr.measured_quantity), 0) as total_measured_quantity,
  COALESCE(SUM(mr.measured_quantity * mi.budgeted_unit_price), 0) as total_measured_amount,
  COALESCE(SUM(CASE WHEN mr.is_certified THEN mr.measured_quantity ELSE 0 END), 0) as certified_quantity,
  COALESCE(SUM(CASE WHEN mr.is_certified THEN mr.measured_quantity * mi.budgeted_unit_price ELSE 0 END), 0) as certified_amount,
  CASE 
    WHEN mi.budgeted_quantity > 0 THEN 
      (COALESCE(SUM(mr.measured_quantity), 0) / mi.budgeted_quantity * 100)
    ELSE 0 
  END as percentage_executed,
  mi.budgeted_total - COALESCE(SUM(mr.measured_quantity * mi.budgeted_unit_price), 0) as pending_amount,
  mi.status
FROM measurement_items mi
LEFT JOIN projects p ON mi.project_id = p.id
LEFT JOIN measurement_chapters mc ON mi.chapter_id = mc.id
LEFT JOIN measurement_records mr ON mi.id = mr.item_id
GROUP BY 
  mi.id, mi.project_id, p.name, mc.chapter_name, mi.item_code, 
  mi.description, mi.unit_of_measure, mi.budgeted_quantity, 
  mi.budgeted_unit_price, mi.budgeted_total, mi.status;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_measurement_chapters_updated_at ON measurement_chapters;
CREATE TRIGGER update_measurement_chapters_updated_at
  BEFORE UPDATE ON measurement_chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_measurement_items_updated_at ON measurement_items;
CREATE TRIGGER update_measurement_items_updated_at
  BEFORE UPDATE ON measurement_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_measurement_records_updated_at ON measurement_records;
CREATE TRIGGER update_measurement_records_updated_at
  BEFORE UPDATE ON measurement_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();