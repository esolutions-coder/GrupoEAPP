/*
  # Módulo de Gestión de Vacaciones

  1. Nuevas Tablas
    - `vacation_balances`
      - `id` (uuid, primary key)
      - `worker_id` (uuid, referencia a workers)
      - `year` (integer)
      - `total_days` (numeric) - Días totales anuales
      - `used_days` (numeric) - Días disfrutados
      - `pending_days` (numeric) - Días pendientes de aprobar
      - `remaining_days` (numeric) - Días restantes
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `vacation_requests`
      - `id` (uuid, primary key)
      - `request_number` (text, unique) - Número de solicitud
      - `worker_id` (uuid, referencia a workers)
      - `year` (integer)
      - `start_date` (date)
      - `end_date` (date)
      - `total_days` (numeric)
      - `vacation_type` (text) - Tipo: Vacaciones anuales, Asuntos personales, etc.
      - `reason` (text)
      - `status` (text) - Pendiente, Aprobado, Rechazado
      - `requested_date` (timestamp)
      - `approved_by` (uuid, referencia a users)
      - `approved_date` (timestamp)
      - `rejection_reason` (text)
      - `signature_data` (text) - Datos de firma digital
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `vacation_alerts`
      - `id` (uuid, primary key)
      - `alert_type` (text) - balance_low, expiring_days, pending_approval
      - `worker_id` (uuid, referencia a workers)
      - `message` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados
*/

-- Tabla de balances de vacaciones
CREATE TABLE IF NOT EXISTS vacation_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid REFERENCES workers(id) ON DELETE CASCADE,
  year integer NOT NULL,
  total_days numeric(5,1) DEFAULT 30.0,
  used_days numeric(5,1) DEFAULT 0.0,
  pending_days numeric(5,1) DEFAULT 0.0,
  remaining_days numeric(5,1) DEFAULT 30.0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(worker_id, year)
);

-- Tabla de solicitudes de vacaciones
CREATE TABLE IF NOT EXISTS vacation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text UNIQUE NOT NULL,
  worker_id uuid REFERENCES workers(id) ON DELETE CASCADE,
  year integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days numeric(5,1) NOT NULL,
  vacation_type text NOT NULL DEFAULT 'Vacaciones anuales',
  reason text,
  status text NOT NULL DEFAULT 'Pendiente',
  requested_date timestamptz DEFAULT now(),
  approved_by uuid,
  approved_date timestamptz,
  rejection_reason text,
  signature_data text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (status IN ('Pendiente', 'Aprobado', 'Rechazado')),
  CHECK (end_date >= start_date)
);

-- Tabla de alertas de vacaciones
CREATE TABLE IF NOT EXISTS vacation_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  worker_id uuid REFERENCES workers(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CHECK (alert_type IN ('balance_low', 'expiring_days', 'pending_approval', 'request_approved', 'request_rejected'))
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_vacation_balances_worker ON vacation_balances(worker_id);
CREATE INDEX IF NOT EXISTS idx_vacation_balances_year ON vacation_balances(year);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_worker ON vacation_requests(worker_id);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_status ON vacation_requests(status);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_dates ON vacation_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_vacation_alerts_worker ON vacation_alerts(worker_id);
CREATE INDEX IF NOT EXISTS idx_vacation_alerts_unread ON vacation_alerts(is_read) WHERE is_read = false;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_vacation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS vacation_balances_updated_at ON vacation_balances;
CREATE TRIGGER vacation_balances_updated_at
  BEFORE UPDATE ON vacation_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_vacation_updated_at();

DROP TRIGGER IF EXISTS vacation_requests_updated_at ON vacation_requests;
CREATE TRIGGER vacation_requests_updated_at
  BEFORE UPDATE ON vacation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_vacation_updated_at();

-- Función para actualizar el balance cuando se aprueba/rechaza una solicitud
CREATE OR REPLACE FUNCTION update_vacation_balance_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la solicitud es aprobada
  IF NEW.status = 'Aprobado' AND OLD.status != 'Aprobado' THEN
    UPDATE vacation_balances
    SET 
      used_days = used_days + NEW.total_days,
      pending_days = pending_days - NEW.total_days,
      remaining_days = total_days - (used_days + NEW.total_days)
    WHERE worker_id = NEW.worker_id AND year = NEW.year;
    
    -- Crear alerta
    INSERT INTO vacation_alerts (alert_type, worker_id, message)
    VALUES ('request_approved', NEW.worker_id, 
            'Tu solicitud de vacaciones del ' || NEW.start_date || ' al ' || NEW.end_date || ' ha sido aprobada.');
  
  -- Si la solicitud es rechazada
  ELSIF NEW.status = 'Rechazado' AND OLD.status != 'Rechazado' THEN
    UPDATE vacation_balances
    SET 
      pending_days = pending_days - NEW.total_days,
      remaining_days = total_days - used_days
    WHERE worker_id = NEW.worker_id AND year = NEW.year;
    
    -- Crear alerta
    INSERT INTO vacation_alerts (alert_type, worker_id, message)
    VALUES ('request_rejected', NEW.worker_id, 
            'Tu solicitud de vacaciones del ' || NEW.start_date || ' al ' || NEW.end_date || ' ha sido rechazada.');
  
  -- Si se crea una nueva solicitud pendiente
  ELSIF TG_OP = 'INSERT' AND NEW.status = 'Pendiente' THEN
    UPDATE vacation_balances
    SET 
      pending_days = pending_days + NEW.total_days,
      remaining_days = total_days - used_days - (pending_days + NEW.total_days)
    WHERE worker_id = NEW.worker_id AND year = NEW.year;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar balance automáticamente
DROP TRIGGER IF EXISTS vacation_balance_auto_update ON vacation_requests;
CREATE TRIGGER vacation_balance_auto_update
  AFTER INSERT OR UPDATE OF status ON vacation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_vacation_balance_on_status_change();

-- Función para generar número de solicitud
CREATE OR REPLACE FUNCTION generate_vacation_request_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix text;
  next_number integer;
BEGIN
  year_suffix := EXTRACT(YEAR FROM NEW.requested_date)::text;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 'VAC-' || year_suffix || '-(.*)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM vacation_requests
  WHERE request_number LIKE 'VAC-' || year_suffix || '-%';
  
  NEW.request_number := 'VAC-' || year_suffix || '-' || LPAD(next_number::text, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar número de solicitud automáticamente
DROP TRIGGER IF EXISTS set_vacation_request_number ON vacation_requests;
CREATE TRIGGER set_vacation_request_number
  BEFORE INSERT ON vacation_requests
  FOR EACH ROW
  WHEN (NEW.request_number IS NULL OR NEW.request_number = '')
  EXECUTE FUNCTION generate_vacation_request_number();

-- Habilitar RLS
ALTER TABLE vacation_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para vacation_balances
CREATE POLICY "Usuarios autenticados pueden ver balances"
  ON vacation_balances FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar balances"
  ON vacation_balances FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar balances"
  ON vacation_balances FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar balances"
  ON vacation_balances FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para vacation_requests
CREATE POLICY "Usuarios autenticados pueden ver solicitudes"
  ON vacation_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear solicitudes"
  ON vacation_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar solicitudes"
  ON vacation_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar solicitudes"
  ON vacation_requests FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para vacation_alerts
CREATE POLICY "Usuarios autenticados pueden ver alertas"
  ON vacation_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear alertas"
  ON vacation_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar alertas"
  ON vacation_alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar alertas"
  ON vacation_alerts FOR DELETE
  TO authenticated
  USING (true);

-- Insertar datos de ejemplo para balances de vacaciones del año actual
DO $$
DECLARE
  current_year integer := EXTRACT(YEAR FROM CURRENT_DATE);
  worker_record RECORD;
BEGIN
  FOR worker_record IN 
    SELECT id FROM workers LIMIT 5
  LOOP
    INSERT INTO vacation_balances (worker_id, year, total_days, used_days, pending_days, remaining_days)
    VALUES (
      worker_record.id,
      current_year,
      30.0,
      0.0,
      0.0,
      30.0
    )
    ON CONFLICT (worker_id, year) DO NOTHING;
  END LOOP;
END $$;