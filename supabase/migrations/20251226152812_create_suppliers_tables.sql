/*
  # Crear tablas para módulo de Proveedores

  ## Resumen
  Sistema completo de gestión de proveedores con identificación, contratos,
  órdenes de compra, albaranes, facturas, pagos, historial de entregas,
  vencimientos, incidencias y notas internas.

  ## Nuevas Tablas

  ### 1. suppliers (Proveedores)
    - `id` (uuid, PK)
    - `supplier_code` (text, unique) - Código único del proveedor
    - `commercial_name` (text) - Nombre comercial
    - `legal_name` (text) - Razón social
    - `cif_nif` (text, unique) - CIF/NIF
    - `category` (text) - Categoría: Materiales, Equipos, Servicios
    - `contact_person` (text) - Persona de contacto
    - `phone` (text) - Teléfono
    - `email` (text) - Email
    - `address` (text) - Dirección
    - `city` (text) - Ciudad
    - `postal_code` (text) - Código postal
    - `country` (text, default: 'España')
    - `payment_terms` (integer) - Días de plazo de pago
    - `bank_account` (text) - IBAN
    - `rating` (numeric) - Valoración (0-5)
    - `certifications` (text[]) - Certificaciones (ISO, CE, etc.)
    - `status` (text) - Estado: active, inactive
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 2. supplier_contracts (Contratos)
    - `id` (uuid, PK)
    - `supplier_id` (uuid, FK)
    - `contract_number` (text, unique)
    - `contract_type` (text) - Tipo: supply, service, rental
    - `start_date` (date)
    - `end_date` (date)
    - `total_amount` (numeric)
    - `payment_terms` (text)
    - `renewal_type` (text) - automatic, manual, none
    - `status` (text) - active, expired, cancelled
    - `notes` (text)
    - `document_url` (text)
    - `created_at` (timestamptz)

  ### 3. supplier_orders (Órdenes de Compra)
    - `id` (uuid, PK)
    - `supplier_id` (uuid, FK)
    - `order_number` (text, unique)
    - `order_date` (date)
    - `expected_delivery` (date)
    - `project_id` (uuid) - FK a proyectos
    - `description` (text)
    - `quantity` (numeric)
    - `unit` (text)
    - `unit_price` (numeric)
    - `total_amount` (numeric)
    - `tax_rate` (numeric, default: 21)
    - `total_with_tax` (numeric)
    - `status` (text) - pending, confirmed, delivered, cancelled
    - `ordered_by` (text)
    - `notes` (text)
    - `created_at` (timestamptz)

  ### 4. supplier_delivery_notes (Albaranes)
    - `id` (uuid, PK)
    - `supplier_id` (uuid, FK)
    - `order_id` (uuid, FK)
    - `delivery_note_number` (text, unique)
    - `delivery_date` (date)
    - `received_by` (text)
    - `quantity_delivered` (numeric)
    - `quantity_accepted` (numeric)
    - `quantity_rejected` (numeric)
    - `rejection_reason` (text)
    - `quality_check` (text) - approved, rejected, partial
    - `notes` (text)
    - `document_url` (text)
    - `created_at` (timestamptz)

  ### 5. supplier_invoices (Facturas)
    - `id` (uuid, PK)
    - `supplier_id` (uuid, FK)
    - `order_id` (uuid, FK)
    - `invoice_number` (text, unique)
    - `invoice_date` (date)
    - `due_date` (date)
    - `description` (text)
    - `subtotal` (numeric)
    - `tax_amount` (numeric)
    - `total_amount` (numeric)
    - `paid_amount` (numeric, default: 0)
    - `pending_amount` (numeric)
    - `status` (text) - pending, partial, paid, overdue, cancelled
    - `payment_method` (text)
    - `document_url` (text)
    - `notes` (text)
    - `created_at` (timestamptz)

  ### 6. supplier_payments (Pagos)
    - `id` (uuid, PK)
    - `supplier_id` (uuid, FK)
    - `invoice_id` (uuid, FK)
    - `payment_date` (date)
    - `amount` (numeric)
    - `payment_method` (text) - transfer, check, cash, card
    - `reference` (text)
    - `approved_by` (text)
    - `bank_account` (text)
    - `notes` (text)
    - `created_at` (timestamptz)

  ### 7. supplier_incidents (Incidencias)
    - `id` (uuid, PK)
    - `supplier_id` (uuid, FK)
    - `order_id` (uuid, FK)
    - `incident_date` (date)
    - `incident_type` (text) - quality, delivery, documentation, other
    - `severity` (text) - low, medium, high, critical
    - `description` (text)
    - `resolution` (text)
    - `resolution_date` (date)
    - `status` (text) - open, in_progress, resolved, closed
    - `reported_by` (text)
    - `assigned_to` (text)
    - `created_at` (timestamptz)

  ### 8. supplier_notes (Notas Internas)
    - `id` (uuid, PK)
    - `supplier_id` (uuid, FK)
    - `note_type` (text) - general, alert, reminder, review
    - `note_date` (date)
    - `title` (text)
    - `content` (text)
    - `priority` (text) - low, normal, high
    - `created_by` (text)
    - `created_at` (timestamptz)

  ## Seguridad
  - RLS habilitado en todas las tablas
  - Políticas restrictivas que requieren autenticación
*/

-- 1. Tabla de Proveedores
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_code text UNIQUE NOT NULL,
  commercial_name text NOT NULL,
  legal_name text,
  cif_nif text UNIQUE,
  category text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  city text,
  postal_code text,
  country text DEFAULT 'España',
  payment_terms integer DEFAULT 30,
  bank_account text,
  rating numeric(2,1) DEFAULT 0,
  certifications text[],
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Tabla de Contratos
CREATE TABLE IF NOT EXISTS supplier_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  contract_number text UNIQUE NOT NULL,
  contract_type text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  total_amount numeric(12,2),
  payment_terms text,
  renewal_type text DEFAULT 'manual',
  status text DEFAULT 'active',
  notes text,
  document_url text,
  created_at timestamptz DEFAULT now()
);

-- 3. Tabla de Órdenes de Compra
CREATE TABLE IF NOT EXISTS supplier_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  order_date date DEFAULT CURRENT_DATE,
  expected_delivery date,
  project_id uuid,
  description text NOT NULL,
  quantity numeric(12,2) NOT NULL,
  unit text NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  tax_rate numeric(5,2) DEFAULT 21,
  total_with_tax numeric(12,2) NOT NULL,
  status text DEFAULT 'pending',
  ordered_by text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 4. Tabla de Albaranes
CREATE TABLE IF NOT EXISTS supplier_delivery_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES supplier_orders(id) ON DELETE SET NULL,
  delivery_note_number text UNIQUE NOT NULL,
  delivery_date date NOT NULL,
  received_by text NOT NULL,
  quantity_delivered numeric(12,2) NOT NULL,
  quantity_accepted numeric(12,2) NOT NULL,
  quantity_rejected numeric(12,2) DEFAULT 0,
  rejection_reason text,
  quality_check text DEFAULT 'approved',
  notes text,
  document_url text,
  created_at timestamptz DEFAULT now()
);

-- 5. Tabla de Facturas
CREATE TABLE IF NOT EXISTS supplier_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES supplier_orders(id) ON DELETE SET NULL,
  invoice_number text UNIQUE NOT NULL,
  invoice_date date NOT NULL,
  due_date date NOT NULL,
  description text NOT NULL,
  subtotal numeric(12,2) NOT NULL,
  tax_amount numeric(12,2) NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  paid_amount numeric(12,2) DEFAULT 0,
  pending_amount numeric(12,2) NOT NULL,
  status text DEFAULT 'pending',
  payment_method text,
  document_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 6. Tabla de Pagos
CREATE TABLE IF NOT EXISTS supplier_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES supplier_invoices(id) ON DELETE CASCADE,
  payment_date date NOT NULL,
  amount numeric(12,2) NOT NULL,
  payment_method text NOT NULL,
  reference text,
  approved_by text,
  bank_account text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 7. Tabla de Incidencias
CREATE TABLE IF NOT EXISTS supplier_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES supplier_orders(id) ON DELETE SET NULL,
  incident_date date DEFAULT CURRENT_DATE,
  incident_type text NOT NULL,
  severity text DEFAULT 'medium',
  description text NOT NULL,
  resolution text,
  resolution_date date,
  status text DEFAULT 'open',
  reported_by text,
  assigned_to text,
  created_at timestamptz DEFAULT now()
);

-- 8. Tabla de Notas Internas
CREATE TABLE IF NOT EXISTS supplier_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  note_type text DEFAULT 'general',
  note_date date DEFAULT CURRENT_DATE,
  title text NOT NULL,
  content text NOT NULL,
  priority text DEFAULT 'normal',
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_contracts_supplier ON supplier_contracts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier ON supplier_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON supplier_orders(status);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_supplier ON supplier_delivery_notes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoices_supplier ON supplier_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON supplier_invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_supplier ON supplier_payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON supplier_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_incidents_supplier ON supplier_incidents(supplier_id);
CREATE INDEX IF NOT EXISTS idx_notes_supplier ON supplier_notes(supplier_id);

-- Habilitar RLS en todas las tablas
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_delivery_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_notes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para suppliers
CREATE POLICY "Usuarios autenticados pueden ver proveedores"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear proveedores"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar proveedores"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar proveedores"
  ON suppliers FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para supplier_contracts
CREATE POLICY "Usuarios autenticados pueden ver contratos"
  ON supplier_contracts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear contratos"
  ON supplier_contracts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar contratos"
  ON supplier_contracts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar contratos"
  ON supplier_contracts FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para supplier_orders
CREATE POLICY "Usuarios autenticados pueden ver órdenes"
  ON supplier_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear órdenes"
  ON supplier_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar órdenes"
  ON supplier_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar órdenes"
  ON supplier_orders FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para supplier_delivery_notes
CREATE POLICY "Usuarios autenticados pueden ver albaranes"
  ON supplier_delivery_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear albaranes"
  ON supplier_delivery_notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar albaranes"
  ON supplier_delivery_notes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar albaranes"
  ON supplier_delivery_notes FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para supplier_invoices
CREATE POLICY "Usuarios autenticados pueden ver facturas"
  ON supplier_invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear facturas"
  ON supplier_invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar facturas"
  ON supplier_invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar facturas"
  ON supplier_invoices FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para supplier_payments
CREATE POLICY "Usuarios autenticados pueden ver pagos"
  ON supplier_payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear pagos"
  ON supplier_payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar pagos"
  ON supplier_payments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar pagos"
  ON supplier_payments FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para supplier_incidents
CREATE POLICY "Usuarios autenticados pueden ver incidencias"
  ON supplier_incidents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear incidencias"
  ON supplier_incidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar incidencias"
  ON supplier_incidents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar incidencias"
  ON supplier_incidents FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para supplier_notes
CREATE POLICY "Usuarios autenticados pueden ver notas"
  ON supplier_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear notas"
  ON supplier_notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar notas"
  ON supplier_notes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar notas"
  ON supplier_notes FOR DELETE
  TO authenticated
  USING (true);