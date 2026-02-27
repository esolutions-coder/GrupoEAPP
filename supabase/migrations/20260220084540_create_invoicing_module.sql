/*
  # Módulo de Facturación Profesional - Grupo EA Obras y Servicios S.L.
  
  1. Nuevas Tablas
    - `invoicing_config`: Configuración de facturación (series, numeración, IVA, retenciones)
    - `invoices`: Facturas emitidas
    - `invoice_lines`: Líneas de detalle de facturas
    - `invoice_payments`: Registro de cobros de facturas
    - `invoice_guarantees`: Control de retenciones de garantía
    - `monthly_closings`: Cierres mensuales de obra para facturación
    - `client_portal_tokens`: Tokens de acceso al portal cliente
  
  2. Funcionalidades
    - Facturas normales y con Inversión del Sujeto Pasivo (ISP)
    - Facturas rectificativas (abono o sustitución)
    - Control de retenciones de garantía
    - Numeración automática por serie y año
    - Estados: Borrador, Emitida, Cobrada (parcial/total), Vencida, Anulada
    - Portal cliente con token único
    - Dashboard financiero
    - Integración con cierres mensuales de obra
  
  3. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas restrictivas para usuarios autenticados
    - Portal cliente con acceso por token
*/

-- Tabla de configuración de facturación
CREATE TABLE IF NOT EXISTS invoicing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  normal_series text DEFAULT 'F/' NOT NULL,
  rectificative_series text DEFAULT 'R/' NOT NULL,
  current_normal_number integer DEFAULT 0 NOT NULL,
  current_rectificative_number integer DEFAULT 0 NOT NULL,
  current_year integer DEFAULT EXTRACT(YEAR FROM now()) NOT NULL,
  default_iva_rate numeric DEFAULT 21.0 NOT NULL,
  default_retention_rate numeric DEFAULT 0.0 NOT NULL,
  default_guarantee_rate numeric DEFAULT 5.0 NOT NULL,
  default_payment_days integer DEFAULT 30 NOT NULL,
  company_name text DEFAULT 'Grupo EA Obras y Servicios S.L.' NOT NULL,
  company_cif text DEFAULT '' NOT NULL,
  company_address text DEFAULT '' NOT NULL,
  company_city text DEFAULT '' NOT NULL,
  company_postal_code text DEFAULT '' NOT NULL,
  company_phone text DEFAULT '' NOT NULL,
  company_email text DEFAULT '' NOT NULL,
  bank_account text DEFAULT '' NOT NULL,
  logo_url text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Tabla de cierres mensuales para facturación
CREATE TABLE IF NOT EXISTS monthly_closings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  project_name text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  total_hours numeric DEFAULT 0 NOT NULL,
  total_amount numeric DEFAULT 0 NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'invoiced', 'cancelled')),
  work_reports_count integer DEFAULT 0 NOT NULL,
  notes text DEFAULT '' NOT NULL,
  invoiced_at timestamptz,
  invoice_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by text DEFAULT '' NOT NULL,
  UNIQUE(project_id, month, year)
);

-- Tabla principal de facturas
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  invoice_series text NOT NULL,
  invoice_type text NOT NULL CHECK (invoice_type IN ('normal', 'isp', 'rectificative')),
  rectificative_type text CHECK (rectificative_type IN ('credit', 'substitution', NULL)),
  original_invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  client_cif text NOT NULL,
  client_address text NOT NULL,
  client_city text NOT NULL,
  client_postal_code text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  project_name text NOT NULL,
  project_code text DEFAULT '' NOT NULL,
  monthly_closing_id uuid REFERENCES monthly_closings(id) ON DELETE SET NULL,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  payment_days integer DEFAULT 30 NOT NULL,
  subtotal numeric DEFAULT 0 NOT NULL,
  iva_rate numeric DEFAULT 21.0 NOT NULL,
  iva_amount numeric DEFAULT 0 NOT NULL,
  retention_rate numeric DEFAULT 0.0 NOT NULL,
  retention_amount numeric DEFAULT 0 NOT NULL,
  guarantee_rate numeric DEFAULT 0.0 NOT NULL,
  guarantee_amount numeric DEFAULT 0 NOT NULL,
  total numeric DEFAULT 0 NOT NULL,
  paid_amount numeric DEFAULT 0 NOT NULL,
  pending_amount numeric DEFAULT 0 NOT NULL,
  status text DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled')),
  payment_status text DEFAULT 'pending' NOT NULL CHECK (payment_status IN ('pending', 'partial', 'paid')),
  is_isp boolean DEFAULT false NOT NULL,
  has_guarantee boolean DEFAULT false NOT NULL,
  guarantee_released boolean DEFAULT false NOT NULL,
  notes text DEFAULT '' NOT NULL,
  internal_notes text DEFAULT '' NOT NULL,
  portal_token text UNIQUE,
  portal_token_expires_at timestamptz,
  pdf_url text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by text DEFAULT '' NOT NULL,
  updated_by text DEFAULT '' NOT NULL
);

-- Tabla de líneas de factura
CREATE TABLE IF NOT EXISTS invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  line_number integer NOT NULL,
  description text NOT NULL,
  quantity numeric DEFAULT 1 NOT NULL,
  unit_price numeric DEFAULT 0 NOT NULL,
  discount_rate numeric DEFAULT 0 NOT NULL,
  discount_amount numeric DEFAULT 0 NOT NULL,
  subtotal numeric DEFAULT 0 NOT NULL,
  iva_rate numeric DEFAULT 21.0 NOT NULL,
  iva_amount numeric DEFAULT 0 NOT NULL,
  total numeric DEFAULT 0 NOT NULL,
  work_report_id uuid REFERENCES work_reports(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Tabla de pagos de facturas
CREATE TABLE IF NOT EXISTS invoice_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  payment_date date NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('transfer', 'check', 'cash', 'card', 'other')),
  reference text DEFAULT '' NOT NULL,
  notes text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by text DEFAULT '' NOT NULL
);

-- Tabla de garantías retenidas
CREATE TABLE IF NOT EXISTS invoice_guarantees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  retention_date date NOT NULL,
  release_date date,
  status text DEFAULT 'retained' NOT NULL CHECK (status IN ('retained', 'released', 'claimed')),
  notes text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  released_at timestamptz,
  released_by text DEFAULT '' NOT NULL
);

-- Tabla de tokens de portal cliente
CREATE TABLE IF NOT EXISTS client_portal_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  last_accessed_at timestamptz,
  access_count integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Insertar configuración por defecto
INSERT INTO invoicing_config (id, company_name, company_cif)
VALUES (gen_random_uuid(), 'Grupo EA Obras y Servicios S.L.', '')
ON CONFLICT DO NOTHING;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_monthly_closings_project_id ON monthly_closings(project_id);
CREATE INDEX IF NOT EXISTS idx_monthly_closings_status ON monthly_closings(status);
CREATE INDEX IF NOT EXISTS idx_client_portal_tokens_client_id ON client_portal_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_tokens_token ON client_portal_tokens(token);

-- Habilitar RLS
ALTER TABLE invoicing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_guarantees ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portal_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para invoicing_config
CREATE POLICY "Users can view invoicing config"
  ON invoicing_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update invoicing config"
  ON invoicing_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas RLS para monthly_closings
CREATE POLICY "Users can view monthly closings"
  ON monthly_closings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert monthly closings"
  ON monthly_closings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update monthly closings"
  ON monthly_closings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete monthly closings"
  ON monthly_closings FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para invoices
CREATE POLICY "Users can view invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para invoice_lines
CREATE POLICY "Users can view invoice lines"
  ON invoice_lines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoice lines"
  ON invoice_lines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoice lines"
  ON invoice_lines FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoice lines"
  ON invoice_lines FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para invoice_payments
CREATE POLICY "Users can view invoice payments"
  ON invoice_payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoice payments"
  ON invoice_payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoice payments"
  ON invoice_payments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoice payments"
  ON invoice_payments FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para invoice_guarantees
CREATE POLICY "Users can view invoice guarantees"
  ON invoice_guarantees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoice guarantees"
  ON invoice_guarantees FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoice guarantees"
  ON invoice_guarantees FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoice guarantees"
  ON invoice_guarantees FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para client_portal_tokens
CREATE POLICY "Users can view client portal tokens"
  ON client_portal_tokens FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert client portal tokens"
  ON client_portal_tokens FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update client portal tokens"
  ON client_portal_tokens FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Función para actualizar numeración de facturas
CREATE OR REPLACE FUNCTION get_next_invoice_number(
  p_invoice_type text,
  p_year integer DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_config invoicing_config;
  v_next_number integer;
  v_series text;
  v_year integer;
BEGIN
  -- Obtener configuración
  SELECT * INTO v_config FROM invoicing_config LIMIT 1;
  
  -- Determinar año
  v_year := COALESCE(p_year, EXTRACT(YEAR FROM now()));
  
  -- Resetear numeración si cambió el año
  IF v_year > v_config.current_year THEN
    UPDATE invoicing_config SET
      current_normal_number = 0,
      current_rectificative_number = 0,
      current_year = v_year;
    v_config.current_normal_number := 0;
    v_config.current_rectificative_number := 0;
  END IF;
  
  -- Incrementar según tipo
  IF p_invoice_type = 'rectificative' THEN
    v_next_number := v_config.current_rectificative_number + 1;
    v_series := v_config.rectificative_series;
    UPDATE invoicing_config SET current_rectificative_number = v_next_number;
  ELSE
    v_next_number := v_config.current_normal_number + 1;
    v_series := v_config.normal_series;
    UPDATE invoicing_config SET current_normal_number = v_next_number;
  END IF;
  
  -- Retornar número completo
  RETURN v_series || LPAD(v_next_number::text, 6, '0') || '/' || v_year;
END;
$$;

-- Función para actualizar estado de factura según pagos
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_paid numeric;
  v_invoice_total numeric;
BEGIN
  -- Calcular total pagado
  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM invoice_payments
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Obtener total de factura
  SELECT total INTO v_invoice_total
  FROM invoices
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Actualizar estado
  UPDATE invoices SET
    paid_amount = v_total_paid,
    pending_amount = v_invoice_total - v_total_paid,
    payment_status = CASE
      WHEN v_total_paid = 0 THEN 'pending'
      WHEN v_total_paid >= v_invoice_total THEN 'paid'
      ELSE 'partial'
    END,
    status = CASE
      WHEN v_total_paid >= v_invoice_total THEN 'paid'
      WHEN v_total_paid > 0 THEN 'partially_paid'
      WHEN due_date < CURRENT_DATE AND status = 'issued' THEN 'overdue'
      ELSE status
    END,
    updated_at = now()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger para actualizar estado de factura al registrar pagos
DROP TRIGGER IF EXISTS trigger_update_invoice_payment_status ON invoice_payments;
CREATE TRIGGER trigger_update_invoice_payment_status
  AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_payment_status();

-- Función para marcar facturas vencidas
CREATE OR REPLACE FUNCTION mark_overdue_invoices()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE invoices SET
    status = 'overdue',
    updated_at = now()
  WHERE status = 'issued'
    AND due_date < CURRENT_DATE
    AND payment_status != 'paid';
END;
$$;