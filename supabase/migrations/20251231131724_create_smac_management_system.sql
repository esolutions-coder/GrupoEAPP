/*
  # Sistema de Gestión de SMAC (Servicios de Mediación, Arbitraje y Conciliación)

  ## Descripción
  Sistema completo para gestionar procedimientos SMAC y demandas laborales de ex trabajadores,
  incluyendo seguimiento de reclamaciones, resoluciones, costes y calendario de actuaciones.

  ## Nuevas Tablas

  ### 1. `smac_records` - Registros principales de SMAC
  Almacena toda la información de cada procedimiento SMAC o demanda judicial.
  
  Columnas principales:
  - Identificación del procedimiento (número SMAC, número judicial)
  - Datos del trabajador demandante
  - Detalles de la reclamación
  - Estado y fase del procedimiento
  - Resolución y acuerdos
  - Representación legal
  - Costes y gastos
  - Nivel de riesgo

  ### 2. `smac_documents` - Documentos asociados
  Almacena la documentación relacionada con cada SMAC.
  
  ### 3. `smac_actions` - Calendario de actuaciones
  Registro de todas las actuaciones y fechas importantes del procedimiento.

  ### 4. `smac_alerts` - Alertas y recordatorios
  Sistema de alertas para fechas límite y acciones requeridas.

  ### 5. `smac_templates` - Plantillas documentales
  Plantillas de documentos legales reutilizables.

  ### 6. `legal_precedents` - Precedentes jurisprudenciales
  Base de conocimiento de casos anteriores y jurisprudencia relevante.

  ## Seguridad
  - RLS habilitado en todas las tablas
  - Solo usuarios autenticados pueden acceder
  - Políticas específicas por operación (SELECT, INSERT, UPDATE, DELETE)
*/

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA PRINCIPAL: smac_records
-- =====================================================
CREATE TABLE IF NOT EXISTS smac_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación del procedimiento
  smac_number text UNIQUE NOT NULL,
  judicial_number text,
  presentation_date date NOT NULL,
  conciliation_date date,
  trial_date date,
  resolution_date date,
  
  -- Datos del trabajador demandante
  worker_name text NOT NULL,
  worker_dni text NOT NULL,
  worker_phone text,
  worker_email text,
  entry_date date NOT NULL,
  exit_date date NOT NULL,
  position text NOT NULL,
  last_salary decimal(10, 2) NOT NULL DEFAULT 0,
  
  -- Datos de la reclamación
  claim_types jsonb NOT NULL DEFAULT '[]',
  claim_description text NOT NULL,
  claimed_amount decimal(12, 2) NOT NULL DEFAULT 0,
  
  -- Estado del procedimiento
  status text NOT NULL DEFAULT 'presentado',
  current_phase text NOT NULL DEFAULT 'Presentado ante SMAC',
  
  -- Resolución y acuerdos
  resolution_type text,
  conciliation_achieved boolean DEFAULT false,
  conciliation_amount decimal(12, 2),
  settlement_amount decimal(12, 2),
  payment_date date,
  payment_method text,
  
  -- Representación legal
  our_lawyer text,
  worker_lawyer text,
  labor_court text,
  
  -- Costas y gastos
  legal_costs decimal(10, 2) DEFAULT 0,
  court_fees decimal(10, 2) DEFAULT 0,
  settlement_costs decimal(10, 2) DEFAULT 0,
  total_cost decimal(12, 2) DEFAULT 0,
  
  -- Observaciones y seguimiento
  notes text,
  risk_level text DEFAULT 'medio',
  probability_loss integer DEFAULT 50,
  
  -- Control interno
  assigned_to text,
  project_id uuid REFERENCES projects(id),
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN (
    'presentado', 'citado', 'conciliado', 'sin_avenencia',
    'demanda_judicial', 'juicio_pendiente', 'sentencia_pendiente',
    'resuelto_favorable', 'resuelto_desfavorable', 'desistimiento', 'caducado'
  )),
  CONSTRAINT valid_risk_level CHECK (risk_level IN ('bajo', 'medio', 'alto', 'critico')),
  CONSTRAINT valid_probability CHECK (probability_loss >= 0 AND probability_loss <= 100)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_smac_records_status ON smac_records(status);
CREATE INDEX IF NOT EXISTS idx_smac_records_worker_dni ON smac_records(worker_dni);
CREATE INDEX IF NOT EXISTS idx_smac_records_dates ON smac_records(presentation_date, conciliation_date, trial_date);
CREATE INDEX IF NOT EXISTS idx_smac_records_project ON smac_records(project_id);
CREATE INDEX IF NOT EXISTS idx_smac_records_assigned ON smac_records(assigned_to);

-- =====================================================
-- TABLA: smac_documents
-- =====================================================
CREATE TABLE IF NOT EXISTS smac_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  smac_id uuid REFERENCES smac_records(id) ON DELETE CASCADE,
  
  name text NOT NULL,
  document_type text NOT NULL,
  file_url text,
  file_size integer,
  mime_type text,
  
  uploaded_by text NOT NULL,
  uploaded_date timestamptz DEFAULT now(),
  
  notes text,
  is_confidential boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smac_documents_smac ON smac_documents(smac_id);
CREATE INDEX IF NOT EXISTS idx_smac_documents_type ON smac_documents(document_type);

-- =====================================================
-- TABLA: smac_actions
-- =====================================================
CREATE TABLE IF NOT EXISTS smac_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  smac_id uuid REFERENCES smac_records(id) ON DELETE CASCADE,
  
  action_date date NOT NULL,
  action_type text NOT NULL,
  description text NOT NULL,
  responsible text,
  completed boolean DEFAULT false,
  completion_date date,
  
  reminder_date date,
  send_reminder boolean DEFAULT false,
  
  notes text,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smac_actions_smac ON smac_actions(smac_id);
CREATE INDEX IF NOT EXISTS idx_smac_actions_date ON smac_actions(action_date);
CREATE INDEX IF NOT EXISTS idx_smac_actions_completed ON smac_actions(completed);
CREATE INDEX IF NOT EXISTS idx_smac_actions_reminder ON smac_actions(reminder_date) WHERE send_reminder = true;

-- =====================================================
-- TABLA: smac_alerts
-- =====================================================
CREATE TABLE IF NOT EXISTS smac_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  smac_id uuid REFERENCES smac_records(id) ON DELETE CASCADE,
  
  alert_type text NOT NULL,
  message text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  due_date date NOT NULL,
  resolved boolean DEFAULT false,
  resolved_date timestamptz,
  resolved_by text,
  
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT valid_alert_type CHECK (alert_type IN ('deadline', 'action_required', 'trial_date', 'payment_due'))
);

CREATE INDEX IF NOT EXISTS idx_smac_alerts_smac ON smac_alerts(smac_id);
CREATE INDEX IF NOT EXISTS idx_smac_alerts_resolved ON smac_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_smac_alerts_due_date ON smac_alerts(due_date) WHERE resolved = false;

-- =====================================================
-- TABLA: smac_templates
-- =====================================================
CREATE TABLE IF NOT EXISTS smac_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name text NOT NULL,
  document_type text NOT NULL,
  content text NOT NULL,
  variables jsonb DEFAULT '[]',
  
  is_active boolean DEFAULT true,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_document_type CHECK (document_type IN (
    'contestacion', 'escrito', 'recurso', 'acuerdo', 'otros'
  ))
);

CREATE INDEX IF NOT EXISTS idx_smac_templates_type ON smac_templates(document_type);
CREATE INDEX IF NOT EXISTS idx_smac_templates_active ON smac_templates(is_active);

-- =====================================================
-- TABLA: legal_precedents
-- =====================================================
CREATE TABLE IF NOT EXISTS legal_precedents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  case_number text NOT NULL,
  court text NOT NULL,
  judgment_date date NOT NULL,
  summary text NOT NULL,
  relevant_for jsonb DEFAULT '[]',
  outcome text NOT NULL,
  key_points jsonb DEFAULT '[]',
  
  link_url text,
  is_favorable boolean,
  
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_legal_precedents_date ON legal_precedents(judgment_date);
CREATE INDEX IF NOT EXISTS idx_legal_precedents_favorable ON legal_precedents(is_favorable);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_smac_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_smac_records_updated_at ON smac_records;
CREATE TRIGGER update_smac_records_updated_at
  BEFORE UPDATE ON smac_records
  FOR EACH ROW
  EXECUTE FUNCTION update_smac_updated_at();

DROP TRIGGER IF EXISTS update_smac_actions_updated_at ON smac_actions;
CREATE TRIGGER update_smac_actions_updated_at
  BEFORE UPDATE ON smac_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_smac_updated_at();

-- Función para calcular coste total automáticamente
CREATE OR REPLACE FUNCTION calculate_smac_total_cost()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_cost = COALESCE(NEW.legal_costs, 0) + 
                   COALESCE(NEW.court_fees, 0) + 
                   COALESCE(NEW.settlement_costs, 0) + 
                   COALESCE(NEW.settlement_amount, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_smac_total_cost_trigger ON smac_records;
CREATE TRIGGER calculate_smac_total_cost_trigger
  BEFORE INSERT OR UPDATE ON smac_records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_smac_total_cost();

-- =====================================================
-- SEGURIDAD: Row Level Security (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE smac_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE smac_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE smac_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE smac_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE smac_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_precedents ENABLE ROW LEVEL SECURITY;

-- Políticas para smac_records
CREATE POLICY "Users can view SMAC records"
  ON smac_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create SMAC records"
  ON smac_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update SMAC records"
  ON smac_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete SMAC records"
  ON smac_records FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para smac_documents
CREATE POLICY "Users can view SMAC documents"
  ON smac_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create SMAC documents"
  ON smac_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update SMAC documents"
  ON smac_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete SMAC documents"
  ON smac_documents FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para smac_actions
CREATE POLICY "Users can view SMAC actions"
  ON smac_actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create SMAC actions"
  ON smac_actions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update SMAC actions"
  ON smac_actions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete SMAC actions"
  ON smac_actions FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para smac_alerts
CREATE POLICY "Users can view SMAC alerts"
  ON smac_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create SMAC alerts"
  ON smac_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update SMAC alerts"
  ON smac_alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete SMAC alerts"
  ON smac_alerts FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para smac_templates
CREATE POLICY "Users can view SMAC templates"
  ON smac_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create SMAC templates"
  ON smac_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update SMAC templates"
  ON smac_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete SMAC templates"
  ON smac_templates FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para legal_precedents
CREATE POLICY "Users can view legal precedents"
  ON legal_precedents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create legal precedents"
  ON legal_precedents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update legal precedents"
  ON legal_precedents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete legal precedents"
  ON legal_precedents FOR DELETE
  TO authenticated
  USING (true);
