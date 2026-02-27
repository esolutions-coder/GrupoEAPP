/*
  # Sistema de Rentabilidad y Control de Alquileres de Maquinaria

  ## Descripción General
  Añade campos para controlar rentabilidad, alquileres y proveedores de maquinaria.

  ## 1. Modificaciones a Tablas Existentes

  ### machinery
  - `ownership_type` - Tipo de tenencia (propiedad/alquiler)
  - `supplier_id` - Proveedor (si es alquiler)
  - `monthly_rental_cost` - Coste mensual de alquiler
  - `rental_start_date` - Fecha inicio alquiler
  - `rental_end_date` - Fecha fin alquiler
  - `operator_monthly_cost` - Coste mensual operador
  - `insurance_monthly_cost` - Coste mensual seguro
  - `maintenance_monthly_budget` - Presupuesto mensual mantenimiento

  ## 2. Nuevas Tablas

  ### machinery_monthly_costs
  - Registro detallado de costes mensuales
  - Combustible, mantenimiento, operador, extras

  ### machinery_profitability_analysis
  - Análisis mensual de rentabilidad por máquina
  - Ingresos vs costes totales
  - Beneficio/pérdida calculado

  ## 3. Vistas

  ### v_machinery_profitability_summary
  - Vista consolidada de rentabilidad

  ### v_supplier_monthly_payments
  - Resumen de pagos mensuales por proveedor

  ## 4. Funciones

  ### calculate_monthly_machinery_costs
  - Calcula costes mensuales automáticamente

  ### calculate_machinery_profitability
  - Calcula rentabilidad mensual
*/

-- =====================================================
-- MODIFICAR TABLA: machinery (añadir campos de rentabilidad)
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'machinery' AND column_name = 'ownership_type'
  ) THEN
    ALTER TABLE machinery ADD COLUMN ownership_type text DEFAULT 'owned';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'machinery' AND column_name = 'supplier_id'
  ) THEN
    ALTER TABLE machinery ADD COLUMN supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'machinery' AND column_name = 'monthly_rental_cost'
  ) THEN
    ALTER TABLE machinery ADD COLUMN monthly_rental_cost decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'machinery' AND column_name = 'rental_start_date'
  ) THEN
    ALTER TABLE machinery ADD COLUMN rental_start_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'machinery' AND column_name = 'rental_end_date'
  ) THEN
    ALTER TABLE machinery ADD COLUMN rental_end_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'machinery' AND column_name = 'operator_monthly_cost'
  ) THEN
    ALTER TABLE machinery ADD COLUMN operator_monthly_cost decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'machinery' AND column_name = 'insurance_monthly_cost'
  ) THEN
    ALTER TABLE machinery ADD COLUMN insurance_monthly_cost decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'machinery' AND column_name = 'maintenance_monthly_budget'
  ) THEN
    ALTER TABLE machinery ADD COLUMN maintenance_monthly_budget decimal(10,2) DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_machinery_ownership ON machinery(ownership_type);
CREATE INDEX IF NOT EXISTS idx_machinery_supplier ON machinery(supplier_id);
CREATE INDEX IF NOT EXISTS idx_machinery_rental_dates ON machinery(rental_start_date, rental_end_date);

-- =====================================================
-- TABLA: machinery_monthly_costs
-- =====================================================
CREATE TABLE IF NOT EXISTS machinery_monthly_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machinery_id uuid NOT NULL REFERENCES machinery(id) ON DELETE CASCADE,
  period text NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL,

  rental_cost decimal(10,2) DEFAULT 0,
  operator_cost decimal(10,2) DEFAULT 0,
  fuel_cost decimal(10,2) DEFAULT 0,
  maintenance_cost decimal(10,2) DEFAULT 0,
  insurance_cost decimal(10,2) DEFAULT 0,
  social_security_cost decimal(10,2) DEFAULT 0,
  other_costs decimal(10,2) DEFAULT 0,

  total_costs decimal(10,2) GENERATED ALWAYS AS (
    COALESCE(rental_cost, 0) +
    COALESCE(operator_cost, 0) +
    COALESCE(fuel_cost, 0) +
    COALESCE(maintenance_cost, 0) +
    COALESCE(insurance_cost, 0) +
    COALESCE(social_security_cost, 0) +
    COALESCE(other_costs, 0)
  ) STORED,

  hours_worked decimal(10,2) DEFAULT 0,
  days_worked integer DEFAULT 0,

  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(machinery_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_costs_machinery ON machinery_monthly_costs(machinery_id);
CREATE INDEX IF NOT EXISTS idx_monthly_costs_period ON machinery_monthly_costs(year, month);

ALTER TABLE machinery_monthly_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage monthly costs"
  ON machinery_monthly_costs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: machinery_profitability_analysis
-- =====================================================
CREATE TABLE IF NOT EXISTS machinery_profitability_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machinery_id uuid NOT NULL REFERENCES machinery(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  period text NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL,

  billed_hours decimal(10,2) DEFAULT 0,
  hourly_rate decimal(10,2) DEFAULT 0,
  total_revenue decimal(10,2) DEFAULT 0,

  total_costs decimal(10,2) DEFAULT 0,

  gross_profit decimal(10,2) GENERATED ALWAYS AS (
    COALESCE(total_revenue, 0) - COALESCE(total_costs, 0)
  ) STORED,

  profit_margin decimal(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN COALESCE(total_revenue, 0) > 0
      THEN ((COALESCE(total_revenue, 0) - COALESCE(total_costs, 0)) / COALESCE(total_revenue, 0)) * 100
      ELSE 0
    END
  ) STORED,

  is_profitable boolean GENERATED ALWAYS AS (
    (COALESCE(total_revenue, 0) - COALESCE(total_costs, 0)) > 0
  ) STORED,

  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(machinery_id, project_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_profitability_machinery ON machinery_profitability_analysis(machinery_id);
CREATE INDEX IF NOT EXISTS idx_profitability_project ON machinery_profitability_analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_profitability_period ON machinery_profitability_analysis(year, month);
CREATE INDEX IF NOT EXISTS idx_profitability_status ON machinery_profitability_analysis(is_profitable);

ALTER TABLE machinery_profitability_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage profitability analysis"
  ON machinery_profitability_analysis FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- VISTA: v_machinery_profitability_summary
-- =====================================================
CREATE OR REPLACE VIEW v_machinery_profitability_summary AS
SELECT
  m.id as machinery_id,
  m.machinery_code,
  m.name as machinery_name,
  m.category,
  m.ownership_type,
  s.commercial_name as supplier_name,
  m.monthly_rental_cost,

  mc.period,
  mc.year,
  mc.month,
  mc.rental_cost,
  mc.operator_cost,
  mc.fuel_cost,
  mc.maintenance_cost,
  mc.insurance_cost,
  mc.social_security_cost,
  mc.other_costs,
  mc.total_costs,
  mc.hours_worked,

  pa.total_revenue,
  pa.gross_profit,
  pa.profit_margin,
  pa.is_profitable,

  CASE
    WHEN mc.hours_worked > 0 THEN mc.total_costs / mc.hours_worked
    ELSE 0
  END as cost_per_hour,

  CASE
    WHEN mc.hours_worked > 0 THEN pa.total_revenue / mc.hours_worked
    ELSE 0
  END as revenue_per_hour

FROM machinery m
LEFT JOIN suppliers s ON s.id = m.supplier_id
LEFT JOIN machinery_monthly_costs mc ON mc.machinery_id = m.id
LEFT JOIN machinery_profitability_analysis pa ON
  pa.machinery_id = m.id AND
  pa.year = mc.year AND
  pa.month = mc.month;

-- =====================================================
-- VISTA: v_supplier_monthly_payments
-- =====================================================
CREATE OR REPLACE VIEW v_supplier_monthly_payments AS
SELECT
  s.id as supplier_id,
  s.commercial_name as supplier_name,
  s.contact_person,
  s.email,
  s.phone,
  mc.year,
  mc.month,
  mc.period,
  COUNT(DISTINCT m.id) as machinery_count,
  SUM(mc.rental_cost) as total_rental_cost,
  STRING_AGG(m.name || ' (' || m.machinery_code || ')', ', ') as machinery_list
FROM suppliers s
INNER JOIN machinery m ON m.supplier_id = s.id AND m.ownership_type = 'rented'
INNER JOIN machinery_monthly_costs mc ON mc.machinery_id = m.id
GROUP BY s.id, s.commercial_name, s.contact_person, s.email, s.phone, mc.year, mc.month, mc.period
ORDER BY mc.year DESC, mc.month DESC, s.commercial_name;

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_monthly_machinery_costs(
  p_machinery_id uuid,
  p_year integer,
  p_month integer
)
RETURNS void AS $$
DECLARE
  v_period text;
  v_rental_cost decimal(10,2);
  v_operator_cost decimal(10,2);
  v_insurance_cost decimal(10,2);
  v_fuel_cost decimal(10,2);
  v_maintenance_cost decimal(10,2);
  v_hours_worked decimal(10,2);
  v_days_worked integer;
BEGIN
  v_period := p_year || '-' || LPAD(p_month::text, 2, '0');

  SELECT
    COALESCE(monthly_rental_cost, 0),
    COALESCE(operator_monthly_cost, 0),
    COALESCE(insurance_monthly_cost, 0)
  INTO v_rental_cost, v_operator_cost, v_insurance_cost
  FROM machinery
  WHERE id = p_machinery_id;

  SELECT COALESCE(SUM(fuel_cost), 0)
  INTO v_fuel_cost
  FROM machinery_daily_reports
  WHERE machinery_id = p_machinery_id
    AND EXTRACT(YEAR FROM report_date) = p_year
    AND EXTRACT(MONTH FROM report_date) = p_month
    AND status = 'approved';

  SELECT COALESCE(SUM(cost), 0)
  INTO v_maintenance_cost
  FROM machinery_maintenance
  WHERE machinery_id = p_machinery_id
    AND EXTRACT(YEAR FROM maintenance_date) = p_year
    AND EXTRACT(MONTH FROM maintenance_date) = p_month;

  SELECT
    COALESCE(SUM(productive_hours + idle_hours), 0),
    COUNT(DISTINCT report_date)
  INTO v_hours_worked, v_days_worked
  FROM machinery_daily_reports
  WHERE machinery_id = p_machinery_id
    AND EXTRACT(YEAR FROM report_date) = p_year
    AND EXTRACT(MONTH FROM report_date) = p_month
    AND status = 'approved';

  INSERT INTO machinery_monthly_costs (
    machinery_id, period, year, month,
    rental_cost, operator_cost, fuel_cost,
    maintenance_cost, insurance_cost,
    hours_worked, days_worked
  ) VALUES (
    p_machinery_id, v_period, p_year, p_month,
    v_rental_cost, v_operator_cost, v_fuel_cost,
    v_maintenance_cost, v_insurance_cost,
    v_hours_worked, v_days_worked
  )
  ON CONFLICT (machinery_id, year, month)
  DO UPDATE SET
    rental_cost = EXCLUDED.rental_cost,
    operator_cost = EXCLUDED.operator_cost,
    fuel_cost = EXCLUDED.fuel_cost,
    maintenance_cost = EXCLUDED.maintenance_cost,
    insurance_cost = EXCLUDED.insurance_cost,
    hours_worked = EXCLUDED.hours_worked,
    days_worked = EXCLUDED.days_worked,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_machinery_profitability(
  p_machinery_id uuid,
  p_project_id uuid,
  p_year integer,
  p_month integer,
  p_hourly_rate decimal DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_period text;
  v_hours decimal(10,2);
  v_hourly_rate decimal(10,2);
  v_revenue decimal(10,2);
  v_costs decimal(10,2);
BEGIN
  v_period := p_year || '-' || LPAD(p_month::text, 2, '0');

  SELECT COALESCE(SUM(productive_hours), 0)
  INTO v_hours
  FROM machinery_daily_reports
  WHERE machinery_id = p_machinery_id
    AND project_id = p_project_id
    AND EXTRACT(YEAR FROM report_date) = p_year
    AND EXTRACT(MONTH FROM report_date) = p_month
    AND status = 'approved';

  IF p_hourly_rate IS NULL THEN
    SELECT hourly_cost INTO v_hourly_rate
    FROM machinery
    WHERE id = p_machinery_id;
  ELSE
    v_hourly_rate := p_hourly_rate;
  END IF;

  v_revenue := v_hours * v_hourly_rate;

  SELECT total_costs INTO v_costs
  FROM machinery_monthly_costs
  WHERE machinery_id = p_machinery_id
    AND year = p_year
    AND month = p_month;

  INSERT INTO machinery_profitability_analysis (
    machinery_id, project_id, period, year, month,
    billed_hours, hourly_rate, total_revenue, total_costs
  ) VALUES (
    p_machinery_id, p_project_id, v_period, p_year, p_month,
    v_hours, v_hourly_rate, v_revenue, COALESCE(v_costs, 0)
  )
  ON CONFLICT (machinery_id, project_id, year, month)
  DO UPDATE SET
    billed_hours = EXCLUDED.billed_hours,
    hourly_rate = EXCLUDED.hourly_rate,
    total_revenue = EXCLUDED.total_revenue,
    total_costs = EXCLUDED.total_costs,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_monthly_costs_updated_at ON machinery_monthly_costs;
CREATE TRIGGER update_monthly_costs_updated_at
  BEFORE UPDATE ON machinery_monthly_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profitability_updated_at ON machinery_profitability_analysis;
CREATE TRIGGER update_profitability_updated_at
  BEFORE UPDATE ON machinery_profitability_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
