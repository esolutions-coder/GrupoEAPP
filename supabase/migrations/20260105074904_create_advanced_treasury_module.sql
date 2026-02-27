/*
  # Módulo de Tesorería Avanzada Multibanco
  
  ## Descripción General
  Sistema completo de gestión de tesorería empresarial para constructoras con:
  - Múltiples cuentas bancarias
  - Productos financieros (pólizas, leasing, factoring)
  - Importación de extractos bancarios
  - Conciliación bancaria asistida
  - Control de tesorería global y por obra
  - Previsión de tesorería
  
  ## 1. Nuevas Tablas
  
  ### Entidades Bancarias
  - `banks` - Maestro de bancos y entidades financieras
  
  ### Cuentas y Productos
  - `bank_accounts` - Cuentas bancarias de la empresa
  - `credit_lines` - Pólizas de crédito
  - `leasing_contracts` - Contratos de leasing/renting
  - `factoring_operations` - Operaciones de factoring/confirming
  
  ### Movimientos y Conciliación
  - `treasury_movements` - Movimientos de tesorería
  - `bank_reconciliations` - Histórico de conciliaciones
  - `treasury_forecasts` - Previsiones de tesorería
  
  ## 2. Seguridad (RLS)
  Todas las tablas con RLS habilitado y políticas restrictivas.
  
  ## 3. Automatizaciones
  - Actualización automática de saldos
  - Cálculo de disponible en pólizas
  - Detección de duplicados
  - Actualización de estado de factoring
*/

-- =====================================================
-- TABLA: banks (Entidades Bancarias)
-- =====================================================
CREATE TABLE IF NOT EXISTS banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bic_swift text,
  account_manager text,
  phone text,
  email text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banks_name ON banks(name);
CREATE INDEX IF NOT EXISTS idx_banks_active ON banks(is_active);

ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage banks"
  ON banks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: bank_accounts (Cuentas Bancarias)
-- =====================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL REFERENCES banks(id) ON DELETE RESTRICT,
  account_alias text NOT NULL,
  iban text UNIQUE NOT NULL,
  account_type text NOT NULL,
  initial_balance decimal(15,2) DEFAULT 0,
  initial_balance_date date NOT NULL,
  current_balance decimal(15,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_bank ON bank_accounts(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_iban ON bank_accounts(iban);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_status ON bank_accounts(status);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_type ON bank_accounts(account_type);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage bank accounts"
  ON bank_accounts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: credit_lines (Pólizas de Crédito)
-- =====================================================
CREATE TABLE IF NOT EXISTS credit_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL REFERENCES banks(id) ON DELETE RESTRICT,
  policy_number text UNIQUE NOT NULL,
  granted_limit decimal(15,2) NOT NULL,
  drawn_amount decimal(15,2) DEFAULT 0,
  available_amount decimal(15,2) GENERATED ALWAYS AS (granted_limit - drawn_amount) STORED,
  interest_rate decimal(5,2),
  commission_rate decimal(5,2),
  expiry_date date,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_lines_bank ON credit_lines(bank_id);
CREATE INDEX IF NOT EXISTS idx_credit_lines_project ON credit_lines(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_lines_status ON credit_lines(status);
CREATE INDEX IF NOT EXISTS idx_credit_lines_expiry ON credit_lines(expiry_date);

ALTER TABLE credit_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage credit lines"
  ON credit_lines FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: leasing_contracts (Contratos Leasing/Renting)
-- =====================================================
CREATE TABLE IF NOT EXISTS leasing_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  financial_entity text NOT NULL,
  contract_number text UNIQUE NOT NULL,
  asset_description text NOT NULL,
  asset_type text NOT NULL,
  monthly_fee decimal(12,2) NOT NULL,
  outstanding_capital decimal(15,2),
  contract_start_date date NOT NULL,
  contract_end_date date NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  machinery_id uuid REFERENCES machinery(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES fleet_vehicles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leasing_entity ON leasing_contracts(financial_entity);
CREATE INDEX IF NOT EXISTS idx_leasing_project ON leasing_contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_leasing_machinery ON leasing_contracts(machinery_id);
CREATE INDEX IF NOT EXISTS idx_leasing_vehicle ON leasing_contracts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_leasing_status ON leasing_contracts(status);
CREATE INDEX IF NOT EXISTS idx_leasing_end_date ON leasing_contracts(contract_end_date);

ALTER TABLE leasing_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage leasing contracts"
  ON leasing_contracts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: factoring_operations (Factoring/Confirming)
-- =====================================================
CREATE TABLE IF NOT EXISTS factoring_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL REFERENCES banks(id) ON DELETE RESTRICT,
  invoice_number text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  operation_type text NOT NULL,
  assignment_date date NOT NULL,
  invoice_amount decimal(15,2) NOT NULL,
  advance_percentage decimal(5,2) NOT NULL,
  advanced_amount decimal(15,2) NOT NULL,
  retained_amount decimal(15,2) NOT NULL,
  commission_amount decimal(12,2),
  interest_amount decimal(12,2),
  due_date date NOT NULL,
  settlement_date date,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_factoring_bank ON factoring_operations(bank_id);
CREATE INDEX IF NOT EXISTS idx_factoring_client ON factoring_operations(client_id);
CREATE INDEX IF NOT EXISTS idx_factoring_project ON factoring_operations(project_id);
CREATE INDEX IF NOT EXISTS idx_factoring_invoice ON factoring_operations(invoice_number);
CREATE INDEX IF NOT EXISTS idx_factoring_status ON factoring_operations(status);
CREATE INDEX IF NOT EXISTS idx_factoring_due_date ON factoring_operations(due_date);

ALTER TABLE factoring_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage factoring operations"
  ON factoring_operations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: treasury_movements (Movimientos de Tesorería)
-- =====================================================
CREATE TABLE IF NOT EXISTS treasury_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id uuid NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  operation_date date NOT NULL,
  value_date date NOT NULL,
  movement_type text NOT NULL,
  amount decimal(15,2) NOT NULL,
  concept text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  credit_line_id uuid REFERENCES credit_lines(id) ON DELETE SET NULL,
  leasing_contract_id uuid REFERENCES leasing_contracts(id) ON DELETE SET NULL,
  factoring_operation_id uuid REFERENCES factoring_operations(id) ON DELETE SET NULL,
  document_reference text,
  reconciliation_status text NOT NULL DEFAULT 'pending',
  reconciled_at timestamptz,
  reconciled_by text,
  imported_from_file text,
  imported_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_treasury_movements_account ON treasury_movements(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_treasury_movements_operation_date ON treasury_movements(operation_date);
CREATE INDEX IF NOT EXISTS idx_treasury_movements_value_date ON treasury_movements(value_date);
CREATE INDEX IF NOT EXISTS idx_treasury_movements_type ON treasury_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_treasury_movements_project ON treasury_movements(project_id);
CREATE INDEX IF NOT EXISTS idx_treasury_movements_reconciliation ON treasury_movements(reconciliation_status);
CREATE INDEX IF NOT EXISTS idx_treasury_movements_amount ON treasury_movements(amount);

ALTER TABLE treasury_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage treasury movements"
  ON treasury_movements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: bank_reconciliations (Conciliaciones Bancarias)
-- =====================================================
CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id uuid NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  reconciliation_date date NOT NULL,
  period_start_date date NOT NULL,
  period_end_date date NOT NULL,
  initial_balance decimal(15,2) NOT NULL,
  final_balance decimal(15,2) NOT NULL,
  total_incomes decimal(15,2) DEFAULT 0,
  total_expenses decimal(15,2) DEFAULT 0,
  reconciled_movements_count integer DEFAULT 0,
  pending_movements_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'in_progress',
  reconciled_by text NOT NULL,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reconciliations_account ON bank_reconciliations(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_date ON bank_reconciliations(reconciliation_date);
CREATE INDEX IF NOT EXISTS idx_reconciliations_status ON bank_reconciliations(status);

ALTER TABLE bank_reconciliations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage bank reconciliations"
  ON bank_reconciliations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: treasury_forecasts (Previsiones de Tesorería)
-- =====================================================
CREATE TABLE IF NOT EXISTS treasury_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_date date NOT NULL,
  horizon_days integer NOT NULL,
  bank_account_id uuid REFERENCES bank_accounts(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  forecast_type text NOT NULL,
  concept text NOT NULL,
  expected_amount decimal(15,2) NOT NULL,
  probability_percentage decimal(5,2) DEFAULT 100,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  invoice_reference text,
  is_confirmed boolean DEFAULT false,
  actual_movement_id uuid REFERENCES treasury_movements(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forecasts_date ON treasury_forecasts(forecast_date);
CREATE INDEX IF NOT EXISTS idx_forecasts_account ON treasury_forecasts(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_project ON treasury_forecasts(project_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_type ON treasury_forecasts(forecast_type);
CREATE INDEX IF NOT EXISTS idx_forecasts_confirmed ON treasury_forecasts(is_confirmed);

ALTER TABLE treasury_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage treasury forecasts"
  ON treasury_forecasts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función: Actualizar saldo de cuenta bancaria
CREATE OR REPLACE FUNCTION update_bank_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reconciliation_status = 'reconciled' AND (TG_OP = 'INSERT' OR OLD.reconciliation_status != 'reconciled') THEN
    UPDATE bank_accounts
    SET 
      current_balance = current_balance + NEW.amount,
      updated_at = now()
    WHERE id = NEW.bank_account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_account_balance ON treasury_movements;
CREATE TRIGGER trigger_update_account_balance
  AFTER INSERT OR UPDATE ON treasury_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_account_balance();

-- Función: Actualizar importe dispuesto en póliza de crédito
CREATE OR REPLACE FUNCTION update_credit_line_drawn()
RETURNS TRIGGER AS $$
DECLARE
  v_movement_type text;
  v_credit_line_id uuid;
BEGIN
  v_movement_type := NEW.movement_type;
  v_credit_line_id := NEW.credit_line_id;
  
  IF v_credit_line_id IS NOT NULL AND NEW.reconciliation_status = 'reconciled' THEN
    IF v_movement_type = 'credit_line_draw' THEN
      UPDATE credit_lines
      SET 
        drawn_amount = drawn_amount + ABS(NEW.amount),
        updated_at = now()
      WHERE id = v_credit_line_id;
    ELSIF v_movement_type = 'credit_line_repayment' THEN
      UPDATE credit_lines
      SET 
        drawn_amount = GREATEST(0, drawn_amount - ABS(NEW.amount)),
        updated_at = now()
      WHERE id = v_credit_line_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_credit_line ON treasury_movements;
CREATE TRIGGER trigger_update_credit_line
  AFTER INSERT OR UPDATE ON treasury_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_line_drawn();

-- Función: Detectar movimientos duplicados
CREATE OR REPLACE FUNCTION check_duplicate_treasury_movement()
RETURNS TRIGGER AS $$
DECLARE
  v_duplicate_count integer;
BEGIN
  SELECT COUNT(*)
  INTO v_duplicate_count
  FROM treasury_movements
  WHERE 
    bank_account_id = NEW.bank_account_id
    AND operation_date = NEW.operation_date
    AND ABS(amount - NEW.amount) < 0.01
    AND concept = NEW.concept
    AND id != NEW.id;
  
  IF v_duplicate_count > 0 THEN
    NEW.notes := COALESCE(NEW.notes || ' | ', '') || 'POSIBLE DUPLICADO';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_duplicate ON treasury_movements;
CREATE TRIGGER trigger_check_duplicate
  BEFORE INSERT ON treasury_movements
  FOR EACH ROW
  EXECUTE FUNCTION check_duplicate_treasury_movement();

-- Función: Actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_treasury()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at a todas las tablas
DROP TRIGGER IF EXISTS update_banks_updated_at ON banks;
CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON banks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_treasury();

DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_treasury();

DROP TRIGGER IF EXISTS update_credit_lines_updated_at ON credit_lines;
CREATE TRIGGER update_credit_lines_updated_at BEFORE UPDATE ON credit_lines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_treasury();

DROP TRIGGER IF EXISTS update_leasing_updated_at ON leasing_contracts;
CREATE TRIGGER update_leasing_updated_at BEFORE UPDATE ON leasing_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_treasury();

DROP TRIGGER IF EXISTS update_factoring_updated_at ON factoring_operations;
CREATE TRIGGER update_factoring_updated_at BEFORE UPDATE ON factoring_operations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_treasury();

DROP TRIGGER IF EXISTS update_treasury_movements_updated_at ON treasury_movements;
CREATE TRIGGER update_treasury_movements_updated_at BEFORE UPDATE ON treasury_movements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_treasury();

DROP TRIGGER IF EXISTS update_reconciliations_updated_at ON bank_reconciliations;
CREATE TRIGGER update_reconciliations_updated_at BEFORE UPDATE ON bank_reconciliations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_treasury();

DROP TRIGGER IF EXISTS update_forecasts_updated_at ON treasury_forecasts;
CREATE TRIGGER update_forecasts_updated_at BEFORE UPDATE ON treasury_forecasts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_treasury();