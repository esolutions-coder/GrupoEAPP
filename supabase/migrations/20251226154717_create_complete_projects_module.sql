/*
  # Módulo Completo de Gestión de Obras

  ## Resumen
  Sistema integral de gestión de obras con presupuestos detallados, mediciones,
  certificaciones, análisis económico, calidad y seguridad, y documentación completa.

  ## Tablas Creadas

  ### 1. projects (actualizada)
    - Datos generales: nombre, cliente, responsable, fechas, precios/hora
    - Estados: planning, in_progress, paused, completed, cancelled

  ### 2. project_budgets (Presupuestos)
    - `id` (uuid, PK)
    - `project_id` (uuid, FK)
    - `version` (integer) - Versión del presupuesto
    - `total_amount` (numeric)
    - `status` (text) - draft, approved, rejected, superseded
    - `created_at` (timestamptz)
    - `approved_by` (text)
    - `approved_at` (timestamptz)
    - `notes` (text)

  ### 3. project_budget_items (Partidas del Presupuesto)
    - `id` (uuid, PK)
    - `budget_id` (uuid, FK)
    - `chapter` (text) - Capítulo/sección
    - `item_code` (text) - Código de partida
    - `description` (text)
    - `unit` (text) - Unidad de medida
    - `quantity` (numeric)
    - `unit_price` (numeric)
    - `total_price` (numeric)
    - `order_index` (integer)

  ### 4. project_measurements (Mediciones)
    - `id` (uuid, PK)
    - `project_id` (uuid, FK)
    - `budget_item_id` (uuid, FK)
    - `measurement_date` (date)
    - `chapter` (text)
    - `description` (text)
    - `planned_quantity` (numeric)
    - `executed_quantity` (numeric)
    - `unit` (text)
    - `reference_docs` (text)
    - `notes` (text)

  ### 5. project_certifications (Certificaciones)
    - `id` (uuid, PK)
    - `project_id` (uuid, FK)
    - `certification_number` (integer)
    - `certification_date` (date)
    - `period_start` (date)
    - `period_end` (date)
    - `total_origin` (numeric) - A origen
    - `total_previous` (numeric) - Anterior
    - `total_current` (numeric) - Actual
    - `deviations` (numeric)
    - `discounts` (numeric)
    - `final_amount` (numeric)
    - `status` (text) - draft, pending, approved, rejected
    - `authorized_by` (text)
    - `approved_at` (timestamptz)
    - `notes` (text)

  ### 6. project_certification_items (Partidas de Certificación)
    - `id` (uuid, PK)
    - `certification_id` (uuid, FK)
    - `budget_item_id` (uuid, FK)
    - `quantity_origin` (numeric)
    - `quantity_previous` (numeric)
    - `quantity_current` (numeric)
    - `unit_price` (numeric)
    - `amount_current` (numeric)

  ### 7. project_costs (Costes)
    - `id` (uuid, PK)
    - `project_id` (uuid, FK)
    - `cost_date` (date)
    - `cost_type` (text) - direct, indirect
    - `category` (text) - labor, materials, machinery, subcontracts, other
    - `description` (text)
    - `amount` (numeric)
    - `supplier_id` (uuid)
    - `invoice_number` (text)
    - `notes` (text)

  ### 8. project_quality_safety (Calidad y Seguridad)
    - `id` (uuid, PK)
    - `project_id` (uuid, FK)
    - `record_date` (date)
    - `record_type` (text) - incident, inspection, measure
    - `category` (text) - quality, safety, environment
    - `severity` (text) - low, medium, high, critical
    - `description` (text)
    - `actions_taken` (text)
    - `responsible` (text)
    - `status` (text) - open, in_progress, resolved, closed
    - `resolution_date` (date)

  ### 9. project_documents (Documentación)
    - `id` (uuid, PK)
    - `project_id` (uuid, FK)
    - `document_type` (text) - photo, plan, report, contract, other
    - `title` (text)
    - `description` (text)
    - `file_url` (text)
    - `file_type` (text)
    - `file_size` (integer)
    - `uploaded_by` (text)
    - `upload_date` (timestamptz)
    - `tags` (text[])

  ### 10. project_budget_changes (Historial de Cambios)
    - `id` (uuid, PK)
    - `budget_id` (uuid, FK)
    - `change_date` (timestamptz)
    - `changed_by` (text)
    - `change_type` (text) - created, updated, approved, rejected
    - `changes_description` (text)
    - `old_values` (jsonb)
    - `new_values` (jsonb)

  ## Seguridad
  - RLS habilitado en todas las tablas
  - Políticas restrictivas que requieren autenticación
*/

-- Actualizar tabla projects existente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'hourly_rate_labor'
  ) THEN
    ALTER TABLE projects ADD COLUMN hourly_rate_labor numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'hourly_rate_machinery'
  ) THEN
    ALTER TABLE projects ADD COLUMN hourly_rate_machinery numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'project_manager'
  ) THEN
    ALTER TABLE projects ADD COLUMN project_manager text;
  END IF;
END $$;

-- 1. Presupuestos
CREATE TABLE IF NOT EXISTS project_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  total_amount numeric(15,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  approved_by text,
  approved_at timestamptz,
  notes text
);

-- 2. Partidas del Presupuesto
CREATE TABLE IF NOT EXISTS project_budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid REFERENCES project_budgets(id) ON DELETE CASCADE,
  chapter text NOT NULL,
  item_code text NOT NULL,
  description text NOT NULL,
  unit text NOT NULL,
  quantity numeric(12,2) NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  total_price numeric(15,2) NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. Mediciones
CREATE TABLE IF NOT EXISTS project_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  budget_item_id uuid REFERENCES project_budget_items(id) ON DELETE SET NULL,
  measurement_date date DEFAULT CURRENT_DATE,
  chapter text NOT NULL,
  description text NOT NULL,
  planned_quantity numeric(12,2) NOT NULL DEFAULT 0,
  executed_quantity numeric(12,2) NOT NULL DEFAULT 0,
  unit text NOT NULL,
  reference_docs text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 4. Certificaciones
CREATE TABLE IF NOT EXISTS project_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  certification_number integer NOT NULL,
  certification_date date NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_origin numeric(15,2) DEFAULT 0,
  total_previous numeric(15,2) DEFAULT 0,
  total_current numeric(15,2) DEFAULT 0,
  deviations numeric(15,2) DEFAULT 0,
  discounts numeric(15,2) DEFAULT 0,
  final_amount numeric(15,2) DEFAULT 0,
  status text DEFAULT 'draft',
  authorized_by text,
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, certification_number)
);

-- 5. Partidas de Certificación
CREATE TABLE IF NOT EXISTS project_certification_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid REFERENCES project_certifications(id) ON DELETE CASCADE,
  budget_item_id uuid REFERENCES project_budget_items(id) ON DELETE SET NULL,
  quantity_origin numeric(12,2) DEFAULT 0,
  quantity_previous numeric(12,2) DEFAULT 0,
  quantity_current numeric(12,2) DEFAULT 0,
  unit_price numeric(12,2) NOT NULL,
  amount_current numeric(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 6. Costes
CREATE TABLE IF NOT EXISTS project_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  cost_date date DEFAULT CURRENT_DATE,
  cost_type text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  supplier_id uuid,
  invoice_number text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 7. Calidad y Seguridad
CREATE TABLE IF NOT EXISTS project_quality_safety (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  record_date date DEFAULT CURRENT_DATE,
  record_type text NOT NULL,
  category text NOT NULL,
  severity text DEFAULT 'medium',
  description text NOT NULL,
  actions_taken text,
  responsible text,
  status text DEFAULT 'open',
  resolution_date date,
  created_at timestamptz DEFAULT now()
);

-- 8. Documentación
CREATE TABLE IF NOT EXISTS project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  title text NOT NULL,
  description text,
  file_url text,
  file_type text,
  file_size integer,
  uploaded_by text,
  upload_date timestamptz DEFAULT now(),
  tags text[]
);

-- 9. Historial de Cambios en Presupuestos
CREATE TABLE IF NOT EXISTS project_budget_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid REFERENCES project_budgets(id) ON DELETE CASCADE,
  change_date timestamptz DEFAULT now(),
  changed_by text,
  change_type text NOT NULL,
  changes_description text,
  old_values jsonb,
  new_values jsonb
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_budgets_project ON project_budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget ON project_budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_chapter ON project_budget_items(chapter);
CREATE INDEX IF NOT EXISTS idx_measurements_project ON project_measurements(project_id);
CREATE INDEX IF NOT EXISTS idx_measurements_date ON project_measurements(measurement_date);
CREATE INDEX IF NOT EXISTS idx_certifications_project ON project_certifications(project_id);
CREATE INDEX IF NOT EXISTS idx_certifications_date ON project_certifications(certification_date);
CREATE INDEX IF NOT EXISTS idx_cert_items_certification ON project_certification_items(certification_id);
CREATE INDEX IF NOT EXISTS idx_costs_project ON project_costs(project_id);
CREATE INDEX IF NOT EXISTS idx_costs_date ON project_costs(cost_date);
CREATE INDEX IF NOT EXISTS idx_quality_safety_project ON project_quality_safety(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_changes_budget ON project_budget_changes(budget_id);

-- Habilitar RLS
ALTER TABLE project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_certification_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_quality_safety ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_budget_changes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para project_budgets
CREATE POLICY "Usuarios autenticados pueden ver presupuestos"
  ON project_budgets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear presupuestos"
  ON project_budgets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar presupuestos"
  ON project_budgets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar presupuestos"
  ON project_budgets FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para project_budget_items
CREATE POLICY "Usuarios autenticados pueden ver partidas"
  ON project_budget_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear partidas"
  ON project_budget_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar partidas"
  ON project_budget_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar partidas"
  ON project_budget_items FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para project_measurements
CREATE POLICY "Usuarios autenticados pueden ver mediciones"
  ON project_measurements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear mediciones"
  ON project_measurements FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar mediciones"
  ON project_measurements FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar mediciones"
  ON project_measurements FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para project_certifications
CREATE POLICY "Usuarios autenticados pueden ver certificaciones"
  ON project_certifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear certificaciones"
  ON project_certifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar certificaciones"
  ON project_certifications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar certificaciones"
  ON project_certifications FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para project_certification_items
CREATE POLICY "Usuarios autenticados pueden ver partidas certificación"
  ON project_certification_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear partidas certificación"
  ON project_certification_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar partidas certificación"
  ON project_certification_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar partidas certificación"
  ON project_certification_items FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para project_costs
CREATE POLICY "Usuarios autenticados pueden ver costes"
  ON project_costs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear costes"
  ON project_costs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar costes"
  ON project_costs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar costes"
  ON project_costs FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para project_quality_safety
CREATE POLICY "Usuarios autenticados pueden ver calidad/seguridad"
  ON project_quality_safety FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear registros calidad/seguridad"
  ON project_quality_safety FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar calidad/seguridad"
  ON project_quality_safety FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar calidad/seguridad"
  ON project_quality_safety FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para project_documents
CREATE POLICY "Usuarios autenticados pueden ver documentos"
  ON project_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear documentos"
  ON project_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar documentos"
  ON project_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar documentos"
  ON project_documents FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para project_budget_changes
CREATE POLICY "Usuarios autenticados pueden ver cambios"
  ON project_budget_changes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear cambios"
  ON project_budget_changes FOR INSERT
  TO authenticated
  WITH CHECK (true);
