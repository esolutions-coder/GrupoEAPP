/*
  # Create Budgets Module

  ## Overview
  Complete budgets module for construction projects with chapters, items,
  versioning, approval workflow, and economic calculations.

  ## Tables Created

  ### 1. budgets
  Main budget records
  - `id` (uuid, primary key)
  - `project_id` (uuid) - Reference to projects
  - `client_id` (text) - Client identifier
  - `contractor` (text) - Executing company
  - `budget_code` (text) - Unique budget code
  - `version` (integer) - Version number
  - `issue_date` (date) - Issue date
  - `status` (text) - draft, in_review, approved, rejected, closed
  - `general_expenses_percentage` (numeric) - General expenses %
  - `industrial_benefit_percentage` (numeric) - Industrial benefit %
  - `discount_percentage` (numeric) - Discount %
  - `tax_percentage` (numeric) - Tax %
  - `subtotal` (numeric) - Calculated subtotal
  - `total` (numeric) - Calculated total
  - `notes` (text) - General notes
  - `created_by` (text) - User who created
  - `approved_by` (text) - User who approved
  - `approved_at` (timestamptz) - Approval date
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. budget_chapters
  Chapters that group budget items
  - `id` (uuid, primary key)
  - `budget_id` (uuid) - Reference to budgets
  - `chapter_code` (text) - Chapter code
  - `chapter_name` (text) - Chapter name
  - `display_order` (integer) - Display order
  - `subtotal` (numeric) - Chapter subtotal
  - `created_at` (timestamptz)

  ### 3. budget_items
  Individual line items in budget
  - `id` (uuid, primary key)
  - `budget_id` (uuid) - Reference to budgets
  - `chapter_id` (uuid) - Reference to budget_chapters
  - `item_code` (text) - Item code
  - `description` (text) - Item description
  - `unit_of_measure` (text) - Unit of measure
  - `estimated_quantity` (numeric) - Estimated quantity
  - `unit_price` (numeric) - Unit price
  - `amount` (numeric) - Calculated amount
  - `display_order` (integer) - Display order
  - `notes` (text) - Item notes
  - `created_at` (timestamptz)

  ### 4. budget_versions
  Budget version history
  - `id` (uuid, primary key)
  - `original_budget_id` (uuid) - Reference to original budget
  - `version` (integer) - Version number
  - `created_by` (text) - User who created version
  - `created_at` (timestamptz)
  - `changes` (text) - Description of changes

  ### 5. budget_documents
  Documents attached to budgets
  - `id` (uuid, primary key)
  - `budget_id` (uuid) - Reference to budgets
  - `document_type` (text) - plan, report, calculation, other
  - `document_name` (text) - Document name
  - `document_url` (text) - Document URL
  - `file_size` (integer) - File size in bytes
  - `uploaded_by` (text) - Who uploaded
  - `uploaded_at` (timestamptz)

  ## Views

  ### budget_summary
  Summary of budgets with totals

  ## Security
  - RLS enabled with public access for testing
*/

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  client_id text,
  contractor text NOT NULL,
  budget_code text NOT NULL,
  version integer DEFAULT 1,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'rejected', 'closed')),
  general_expenses_percentage numeric(5,2) DEFAULT 13.00,
  industrial_benefit_percentage numeric(5,2) DEFAULT 6.00,
  discount_percentage numeric(5,2) DEFAULT 0.00,
  tax_percentage numeric(5,2) DEFAULT 21.00,
  subtotal numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  notes text,
  created_by text,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, budget_code, version)
);

-- Create budget_chapters table
CREATE TABLE IF NOT EXISTS budget_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  chapter_code text NOT NULL,
  chapter_name text NOT NULL,
  display_order integer DEFAULT 0,
  subtotal numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create budget_items table
CREATE TABLE IF NOT EXISTS budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES budget_chapters(id) ON DELETE CASCADE NOT NULL,
  item_code text NOT NULL,
  description text NOT NULL,
  unit_of_measure text NOT NULL DEFAULT 'ud',
  estimated_quantity numeric(12,3) DEFAULT 0,
  unit_price numeric(10,2) DEFAULT 0,
  amount numeric(12,2) DEFAULT 0,
  display_order integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create budget_versions table
CREATE TABLE IF NOT EXISTS budget_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  version integer NOT NULL,
  created_by text,
  created_at timestamptz DEFAULT now(),
  changes text
);

-- Create budget_documents table
CREATE TABLE IF NOT EXISTS budget_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  document_type text DEFAULT 'other' CHECK (document_type IN ('plan', 'report', 'calculation', 'other')),
  document_name text NOT NULL,
  document_url text NOT NULL,
  file_size integer DEFAULT 0,
  uploaded_by text,
  uploaded_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_budgets_project ON budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
CREATE INDEX IF NOT EXISTS idx_budgets_code ON budgets(budget_code);
CREATE INDEX IF NOT EXISTS idx_budget_chapters_budget ON budget_chapters(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_chapters_order ON budget_chapters(display_order);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget ON budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_chapter ON budget_items(chapter_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_order ON budget_items(display_order);
CREATE INDEX IF NOT EXISTS idx_budget_versions_original ON budget_versions(original_budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_documents_budget ON budget_documents(budget_id);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_documents ENABLE ROW LEVEL SECURITY;

-- Policies for budgets
CREATE POLICY "Allow public read access to budgets"
  ON budgets FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to budgets"
  ON budgets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to budgets"
  ON budgets FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from budgets"
  ON budgets FOR DELETE
  USING (true);

-- Policies for budget_chapters
CREATE POLICY "Allow public read access to budget_chapters"
  ON budget_chapters FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to budget_chapters"
  ON budget_chapters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to budget_chapters"
  ON budget_chapters FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from budget_chapters"
  ON budget_chapters FOR DELETE
  USING (true);

-- Policies for budget_items
CREATE POLICY "Allow public read access to budget_items"
  ON budget_items FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to budget_items"
  ON budget_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to budget_items"
  ON budget_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from budget_items"
  ON budget_items FOR DELETE
  USING (true);

-- Policies for budget_versions
CREATE POLICY "Allow public read access to budget_versions"
  ON budget_versions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to budget_versions"
  ON budget_versions FOR INSERT
  WITH CHECK (true);

-- Policies for budget_documents
CREATE POLICY "Allow public read access to budget_documents"
  ON budget_documents FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to budget_documents"
  ON budget_documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to budget_documents"
  ON budget_documents FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from budget_documents"
  ON budget_documents FOR DELETE
  USING (true);

-- Create view for budget summary
CREATE OR REPLACE VIEW budget_summary AS
SELECT 
  b.id as budget_id,
  b.project_id,
  p.name as project_name,
  b.budget_code,
  b.version,
  b.contractor,
  b.issue_date,
  b.status,
  b.subtotal,
  b.total,
  b.general_expenses_percentage,
  b.industrial_benefit_percentage,
  b.discount_percentage,
  b.tax_percentage,
  COUNT(DISTINCT bc.id) as total_chapters,
  COUNT(DISTINCT bi.id) as total_items,
  b.approved_by,
  b.approved_at,
  b.created_by,
  b.created_at,
  b.updated_at
FROM budgets b
LEFT JOIN projects p ON b.project_id = p.id
LEFT JOIN budget_chapters bc ON b.id = bc.budget_id
LEFT JOIN budget_items bi ON b.id = bi.budget_id
GROUP BY 
  b.id, b.project_id, p.name, b.budget_code, b.version, b.contractor,
  b.issue_date, b.status, b.subtotal, b.total,
  b.general_expenses_percentage, b.industrial_benefit_percentage,
  b.discount_percentage, b.tax_percentage, b.approved_by, b.approved_at,
  b.created_by, b.created_at, b.updated_at;

-- Create trigger function to update budget item amounts
CREATE OR REPLACE FUNCTION update_budget_item_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.amount = NEW.estimated_quantity * NEW.unit_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget items
DROP TRIGGER IF EXISTS trigger_update_budget_item_amount ON budget_items;
CREATE TRIGGER trigger_update_budget_item_amount
  BEFORE INSERT OR UPDATE ON budget_items
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_item_amount();

-- Create trigger function to update chapter subtotals
CREATE OR REPLACE FUNCTION update_chapter_subtotal()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE budget_chapters
  SET subtotal = (
    SELECT COALESCE(SUM(amount), 0)
    FROM budget_items
    WHERE chapter_id = COALESCE(NEW.chapter_id, OLD.chapter_id)
  )
  WHERE id = COALESCE(NEW.chapter_id, OLD.chapter_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for chapter subtotal updates
DROP TRIGGER IF EXISTS trigger_update_chapter_subtotal ON budget_items;
CREATE TRIGGER trigger_update_chapter_subtotal
  AFTER INSERT OR UPDATE OR DELETE ON budget_items
  FOR EACH ROW
  EXECUTE FUNCTION update_chapter_subtotal();

-- Create trigger function to update budget totals
CREATE OR REPLACE FUNCTION update_budget_totals()
RETURNS TRIGGER AS $$
DECLARE
  budget_rec RECORD;
  base_subtotal numeric;
  with_expenses numeric;
  with_benefit numeric;
  with_discount numeric;
  final_total numeric;
BEGIN
  SELECT * INTO budget_rec
  FROM budgets
  WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
  
  SELECT COALESCE(SUM(amount), 0) INTO base_subtotal
  FROM budget_items
  WHERE budget_id = budget_rec.id;
  
  with_expenses = base_subtotal * (1 + budget_rec.general_expenses_percentage / 100);
  with_benefit = with_expenses * (1 + budget_rec.industrial_benefit_percentage / 100);
  with_discount = with_benefit * (1 - budget_rec.discount_percentage / 100);
  final_total = with_discount * (1 + budget_rec.tax_percentage / 100);
  
  UPDATE budgets
  SET 
    subtotal = base_subtotal,
    total = final_total,
    updated_at = now()
  WHERE id = budget_rec.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget total updates
DROP TRIGGER IF EXISTS trigger_update_budget_totals ON budget_items;
CREATE TRIGGER trigger_update_budget_totals
  AFTER INSERT OR UPDATE OR DELETE ON budget_items
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_totals();

-- Create trigger for percentage changes
DROP TRIGGER IF EXISTS trigger_update_budget_percentages ON budgets;
CREATE TRIGGER trigger_update_budget_percentages
  AFTER UPDATE OF general_expenses_percentage, industrial_benefit_percentage, 
                 discount_percentage, tax_percentage ON budgets
  FOR EACH ROW
  WHEN (OLD.general_expenses_percentage IS DISTINCT FROM NEW.general_expenses_percentage OR
        OLD.industrial_benefit_percentage IS DISTINCT FROM NEW.industrial_benefit_percentage OR
        OLD.discount_percentage IS DISTINCT FROM NEW.discount_percentage OR
        OLD.tax_percentage IS DISTINCT FROM NEW.tax_percentage)
  EXECUTE FUNCTION update_budget_totals();