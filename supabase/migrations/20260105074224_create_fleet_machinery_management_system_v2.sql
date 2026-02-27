/*
  # Sistema Integrado de Gestión de Flota y Maquinaria
  
  ## Descripción General
  Sistema completo de control de maquinaria y vehículos integrado con obras, operarios, producción y EPIs.
  NO incluye módulo de fichajes, se basa en partes diarios de producción.
  
  ## 1. Nuevas Tablas
  
  ### Maquinaria
  - `machinery` - Catálogo de maquinaria y equipos
  - `machinery_epi_requirements` - EPIs obligatorios por tipo de maquinaria
  - `machinery_operator_authorizations` - Operarios autorizados por máquina
  - `machinery_daily_reports` - Partes diarios de maquinaria
  - `machinery_maintenance` - Mantenimientos de maquinaria
  
  ### Vehículos
  - `fleet_vehicles` - Vehículos de la empresa
  - `vehicle_daily_usage` - Uso diario de vehículos
  - `vehicle_maintenance` - Mantenimientos de vehículos
  - `vehicle_alerts` - Alertas de uso indebido o excesivo
  
  ### Costes
  - `project_machinery_costs` - Costes de maquinaria por obra
  
  ## 2. Seguridad (RLS)
  Todas las tablas tienen RLS habilitado con políticas restrictivas para usuarios autenticados.
  
  ## 3. Automatizaciones
  - Actualización automática de horómetro de maquinaria
  - Actualización automática de odómetro de vehículos
  - Generación automática de alertas
*/

-- =====================================================
-- TABLA: machinery (Maquinaria)
-- =====================================================
CREATE TABLE IF NOT EXISTS machinery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machinery_code text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  brand text,
  model text,
  serial_number text,
  license_plate text,
  purchase_date date,
  purchase_price decimal(12,2),
  current_value decimal(12,2),
  hourly_cost decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  location text,
  requires_operator_license boolean DEFAULT false,
  fuel_type text,
  fuel_capacity decimal(10,2),
  max_hours_before_maintenance integer DEFAULT 250,
  current_hours integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_machinery_code ON machinery(machinery_code);
CREATE INDEX IF NOT EXISTS idx_machinery_status ON machinery(status);
CREATE INDEX IF NOT EXISTS idx_machinery_category ON machinery(category);

ALTER TABLE machinery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view machinery"
  ON machinery FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert machinery"
  ON machinery FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update machinery"
  ON machinery FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete machinery"
  ON machinery FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- TABLA: machinery_epi_requirements
-- =====================================================
CREATE TABLE IF NOT EXISTS machinery_epi_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machinery_id uuid NOT NULL REFERENCES machinery(id) ON DELETE CASCADE,
  epi_item_id uuid NOT NULL REFERENCES epi_items(id) ON DELETE CASCADE,
  is_mandatory boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(machinery_id, epi_item_id)
);

CREATE INDEX IF NOT EXISTS idx_mach_epi_machinery ON machinery_epi_requirements(machinery_id);
CREATE INDEX IF NOT EXISTS idx_mach_epi_item ON machinery_epi_requirements(epi_item_id);

ALTER TABLE machinery_epi_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage machinery EPI requirements"
  ON machinery_epi_requirements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: machinery_operator_authorizations
-- =====================================================
CREATE TABLE IF NOT EXISTS machinery_operator_authorizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  machinery_id uuid NOT NULL REFERENCES machinery(id) ON DELETE CASCADE,
  authorization_date date NOT NULL,
  expiry_date date,
  authorized_by text NOT NULL,
  certification_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(worker_id, machinery_id)
);

CREATE INDEX IF NOT EXISTS idx_mach_auth_worker ON machinery_operator_authorizations(worker_id);
CREATE INDEX IF NOT EXISTS idx_mach_auth_machinery ON machinery_operator_authorizations(machinery_id);
CREATE INDEX IF NOT EXISTS idx_mach_auth_expiry ON machinery_operator_authorizations(expiry_date);

ALTER TABLE machinery_operator_authorizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage machinery authorizations"
  ON machinery_operator_authorizations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: machinery_daily_reports
-- =====================================================
CREATE TABLE IF NOT EXISTS machinery_daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL,
  machinery_id uuid NOT NULL REFERENCES machinery(id) ON DELETE RESTRICT,
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  work_report_id uuid REFERENCES work_reports(id) ON DELETE SET NULL,
  start_hour_meter decimal(10,2),
  end_hour_meter decimal(10,2),
  productive_hours decimal(10,2) NOT NULL DEFAULT 0,
  idle_hours decimal(10,2) DEFAULT 0,
  activity_description text,
  production_quantity decimal(12,3),
  production_unit text,
  fuel_consumed decimal(10,2),
  fuel_cost decimal(10,2),
  incident_occurred boolean DEFAULT false,
  incident_description text,
  status text NOT NULL DEFAULT 'draft',
  submitted_by text,
  approved_by text,
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mach_report_date ON machinery_daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_mach_report_machinery ON machinery_daily_reports(machinery_id);
CREATE INDEX IF NOT EXISTS idx_mach_report_worker ON machinery_daily_reports(worker_id);
CREATE INDEX IF NOT EXISTS idx_mach_report_project ON machinery_daily_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_mach_report_status ON machinery_daily_reports(status);

ALTER TABLE machinery_daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage machinery daily reports"
  ON machinery_daily_reports FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: machinery_maintenance
-- =====================================================
CREATE TABLE IF NOT EXISTS machinery_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machinery_id uuid NOT NULL REFERENCES machinery(id) ON DELETE CASCADE,
  maintenance_date date NOT NULL,
  maintenance_type text NOT NULL,
  description text NOT NULL,
  hours_at_maintenance integer,
  cost decimal(10,2),
  performed_by text,
  next_maintenance_date date,
  next_maintenance_hours integer,
  downtime_hours decimal(10,2),
  parts_replaced text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mach_maint_machinery ON machinery_maintenance(machinery_id);
CREATE INDEX IF NOT EXISTS idx_mach_maint_date ON machinery_maintenance(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_mach_maint_type ON machinery_maintenance(maintenance_type);

ALTER TABLE machinery_maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage machinery maintenance"
  ON machinery_maintenance FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: fleet_vehicles
-- =====================================================
CREATE TABLE IF NOT EXISTS fleet_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_code text UNIQUE NOT NULL,
  license_plate text UNIQUE NOT NULL,
  vehicle_type text NOT NULL,
  brand text,
  model text,
  year integer,
  fuel_type text,
  fuel_capacity decimal(10,2),
  purchase_date date,
  purchase_price decimal(12,2),
  current_odometer integer DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  assigned_to_worker_id uuid REFERENCES workers(id) ON DELETE SET NULL,
  monthly_km_limit integer DEFAULT 2000,
  insurance_company text,
  insurance_policy text,
  insurance_expiry date,
  itv_expiry date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_code ON fleet_vehicles(vehicle_code);
CREATE INDEX IF NOT EXISTS idx_vehicle_plate ON fleet_vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicle_assigned ON fleet_vehicles(assigned_to_worker_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_status ON fleet_vehicles(status);

ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage vehicles"
  ON fleet_vehicles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: vehicle_daily_usage
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicle_daily_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_date date NOT NULL,
  vehicle_id uuid NOT NULL REFERENCES fleet_vehicles(id) ON DELETE RESTRICT,
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  start_odometer integer NOT NULL,
  end_odometer integer NOT NULL,
  km_traveled integer GENERATED ALWAYS AS (end_odometer - start_odometer) STORED,
  purpose text,
  route text,
  fuel_refilled decimal(10,2),
  fuel_cost decimal(10,2),
  toll_cost decimal(10,2),
  parking_cost decimal(10,2),
  incident_occurred boolean DEFAULT false,
  incident_description text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_usage_date ON vehicle_daily_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_usage_vehicle ON vehicle_daily_usage(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_usage_worker ON vehicle_daily_usage(worker_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_usage_project ON vehicle_daily_usage(project_id);

ALTER TABLE vehicle_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage vehicle usage"
  ON vehicle_daily_usage FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: vehicle_maintenance
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
  maintenance_date date NOT NULL,
  maintenance_type text NOT NULL,
  description text NOT NULL,
  odometer_at_maintenance integer,
  cost decimal(10,2),
  workshop text,
  invoice_number text,
  next_maintenance_date date,
  next_maintenance_km integer,
  parts_replaced text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_maint_vehicle ON vehicle_maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maint_date ON vehicle_maintenance(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_maint_type ON vehicle_maintenance(maintenance_type);

ALTER TABLE vehicle_maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage vehicle maintenance"
  ON vehicle_maintenance FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: vehicle_alerts
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicle_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  vehicle_id uuid NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES workers(id) ON DELETE SET NULL,
  alert_date date NOT NULL,
  description text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  reviewed_by text,
  reviewed_at timestamptz,
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_alert_vehicle ON vehicle_alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_alert_worker ON vehicle_alerts(worker_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_alert_status ON vehicle_alerts(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_alert_severity ON vehicle_alerts(severity);

ALTER TABLE vehicle_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage vehicle alerts"
  ON vehicle_alerts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLA: project_machinery_costs
-- =====================================================
CREATE TABLE IF NOT EXISTS project_machinery_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  machinery_id uuid NOT NULL REFERENCES machinery(id) ON DELETE CASCADE,
  period text NOT NULL,
  total_hours decimal(10,2) DEFAULT 0,
  total_cost decimal(12,2) DEFAULT 0,
  production_quantity decimal(12,3),
  production_unit text,
  cost_per_unit decimal(10,2),
  theoretical_cost decimal(12,2),
  variance decimal(12,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, machinery_id, period)
);

CREATE INDEX IF NOT EXISTS idx_proj_mach_cost_project ON project_machinery_costs(project_id);
CREATE INDEX IF NOT EXISTS idx_proj_mach_cost_machinery ON project_machinery_costs(machinery_id);
CREATE INDEX IF NOT EXISTS idx_proj_mach_cost_period ON project_machinery_costs(period);

ALTER TABLE project_machinery_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage project machinery costs"
  ON project_machinery_costs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función: Actualizar horómetro de maquinaria
CREATE OR REPLACE FUNCTION update_machinery_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status != 'approved') THEN
    UPDATE machinery
    SET 
      current_hours = current_hours + COALESCE(NEW.productive_hours, 0) + COALESCE(NEW.idle_hours, 0),
      updated_at = now()
    WHERE id = NEW.machinery_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_machinery_hours ON machinery_daily_reports;
CREATE TRIGGER trigger_update_machinery_hours
  AFTER INSERT OR UPDATE ON machinery_daily_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_machinery_hours();

-- Función: Actualizar odómetro de vehículo
CREATE OR REPLACE FUNCTION update_vehicle_odometer()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE fleet_vehicles
  SET 
    current_odometer = NEW.end_odometer,
    updated_at = now()
  WHERE id = NEW.vehicle_id AND NEW.end_odometer > current_odometer;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_vehicle_odometer ON vehicle_daily_usage;
CREATE TRIGGER trigger_update_vehicle_odometer
  AFTER INSERT ON vehicle_daily_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_odometer();

-- Función: Generar alertas automáticas de vehículos
CREATE OR REPLACE FUNCTION check_vehicle_usage_alerts()
RETURNS TRIGGER AS $$
DECLARE
  v_monthly_km integer;
  v_monthly_limit integer;
BEGIN
  -- Verificar km mensuales
  SELECT 
    COALESCE(SUM(km_traveled), 0),
    fv.monthly_km_limit
  INTO v_monthly_km, v_monthly_limit
  FROM vehicle_daily_usage vdu
  JOIN fleet_vehicles fv ON fv.id = vdu.vehicle_id
  WHERE vdu.vehicle_id = NEW.vehicle_id
    AND EXTRACT(YEAR FROM vdu.usage_date) = EXTRACT(YEAR FROM NEW.usage_date)
    AND EXTRACT(MONTH FROM vdu.usage_date) = EXTRACT(MONTH FROM NEW.usage_date)
  GROUP BY fv.monthly_km_limit;

  -- Alerta si supera el 90% del límite mensual
  IF v_monthly_km > (v_monthly_limit * 0.9) THEN
    INSERT INTO vehicle_alerts (
      alert_type, vehicle_id, worker_id, alert_date, description, severity, status
    ) VALUES (
      'excessive_km',
      NEW.vehicle_id,
      NEW.worker_id,
      NEW.usage_date,
      format('Vehículo ha superado el 90%% del límite mensual: %s km de %s km', v_monthly_km, v_monthly_limit),
      'high',
      'pending'
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- Alerta si km diarios > 500
  IF NEW.km_traveled > 500 THEN
    INSERT INTO vehicle_alerts (
      alert_type, vehicle_id, worker_id, alert_date, description, severity, status
    ) VALUES (
      'excessive_km',
      NEW.vehicle_id,
      NEW.worker_id,
      NEW.usage_date,
      format('Desplazamiento diario excesivo: %s km', NEW.km_traveled),
      'medium',
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_vehicle_alerts ON vehicle_daily_usage;
CREATE TRIGGER trigger_check_vehicle_alerts
  AFTER INSERT ON vehicle_daily_usage
  FOR EACH ROW
  EXECUTE FUNCTION check_vehicle_usage_alerts();

-- Función: Actualizar timestamp en update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at a todas las tablas
DROP TRIGGER IF EXISTS update_machinery_updated_at ON machinery;
CREATE TRIGGER update_machinery_updated_at BEFORE UPDATE ON machinery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_machinery_epi_updated_at ON machinery_epi_requirements;
CREATE TRIGGER update_machinery_epi_updated_at BEFORE UPDATE ON machinery_epi_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mach_auth_updated_at ON machinery_operator_authorizations;
CREATE TRIGGER update_mach_auth_updated_at BEFORE UPDATE ON machinery_operator_authorizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mach_report_updated_at ON machinery_daily_reports;
CREATE TRIGGER update_mach_report_updated_at BEFORE UPDATE ON machinery_daily_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mach_maint_updated_at ON machinery_maintenance;
CREATE TRIGGER update_mach_maint_updated_at BEFORE UPDATE ON machinery_maintenance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicle_updated_at ON fleet_vehicles;
CREATE TRIGGER update_vehicle_updated_at BEFORE UPDATE ON fleet_vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicle_usage_updated_at ON vehicle_daily_usage;
CREATE TRIGGER update_vehicle_usage_updated_at BEFORE UPDATE ON vehicle_daily_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicle_maint_updated_at ON vehicle_maintenance;
CREATE TRIGGER update_vehicle_maint_updated_at BEFORE UPDATE ON vehicle_maintenance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicle_alert_updated_at ON vehicle_alerts;
CREATE TRIGGER update_vehicle_alert_updated_at BEFORE UPDATE ON vehicle_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proj_mach_cost_updated_at ON project_machinery_costs;
CREATE TRIGGER update_proj_mach_cost_updated_at BEFORE UPDATE ON project_machinery_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();