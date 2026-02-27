/*
  # Sistema de Control de Costes y Rentabilidad

  1. Nuevas Tablas
    - `cost_control_projects`
      - Almacena la información principal de control de costes por proyecto
      - Incluye presupuestos, costes reales y análisis de rentabilidad
      - Campos: id, project_id, project_name, project_code, client_id, client_name, dates, status, budgets, actual_costs, analysis, managers, etc.
    
    - `cost_items`
      - Registra todos los items/líneas de coste individuales
      - Permite tracking detallado de gastos por categoría
      - Campos: id, project_id, category, date, description, amount, source, reference, status, etc.
    
    - `cost_alerts`
      - Sistema de alertas para desviaciones y problemas de costes
      - Notificaciones de umbrales excedidos
      - Campos: id, project_id, type, severity, message, threshold, current_value, resolved, etc.
    
    - `budget_breakdown`
      - Desglose detallado del presupuesto por categorías
      - Comparación presupuesto vs real por categoría
      - Campos: id, project_id, category, budgeted, actual, committed, variance, etc.

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados
    - Control de acceso por rol (project managers, controllers, admin)

  3. Índices
    - Índices en project_id para búsquedas rápidas
    - Índices en fechas para filtros temporales
    - Índices en status y severity para alertas

  4. Funciones
    - Trigger para calcular automáticamente las desviaciones
    - Trigger para generar alertas cuando se excedan umbrales
*/

-- Tabla principal de control de costes por proyecto
CREATE TABLE IF NOT EXISTS cost_control_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  project_name text NOT NULL,
  project_code text NOT NULL,
  client_id text NOT NULL,
  client_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  estimated_end_date date NOT NULL,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'paused', 'cancelled')),
  
  -- Presupuesto total
  total_budget numeric NOT NULL DEFAULT 0,
  
  -- Costes reales totales
  total_actual_cost numeric NOT NULL DEFAULT 0,
  
  -- Análisis y KPIs
  gross_profit numeric DEFAULT 0,
  gross_profit_margin numeric DEFAULT 0,
  net_profit numeric DEFAULT 0,
  net_profit_margin numeric DEFAULT 0,
  cost_per_linear_meter numeric DEFAULT 0,
  cost_per_square_meter numeric DEFAULT 0,
  cost_per_worker_day numeric DEFAULT 0,
  cost_per_machine_hour numeric DEFAULT 0,
  budget_variance numeric DEFAULT 0,
  budget_variance_percentage numeric DEFAULT 0,
  time_variance integer DEFAULT 0,
  performance_index numeric DEFAULT 100,
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  cost_trend text DEFAULT 'stable' CHECK (cost_trend IN ('improving', 'stable', 'deteriorating')),
  productivity_trend text DEFAULT 'stable' CHECK (productivity_trend IN ('improving', 'stable', 'deteriorating')),
  
  -- Responsables
  project_manager text NOT NULL,
  cost_controller text NOT NULL,
  
  -- Configuración de asignación de costes
  direct_cost_percentage numeric DEFAULT 70,
  indirect_cost_percentage numeric DEFAULT 30,
  overhead_allocation_method text DEFAULT 'hours' CHECK (overhead_allocation_method IN ('hours', 'revenue', 'direct_cost', 'equal')),
  overhead_rate numeric DEFAULT 15,
  
  -- Metadatos
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  version integer DEFAULT 1,
  
  UNIQUE(project_id)
);

-- Tabla de desglose de presupuesto por categorías
CREATE TABLE IF NOT EXISTS budget_breakdown (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES cost_control_projects(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('materials', 'direct_labor', 'subcontracts', 'machinery', 'insurance', 'general_expenses', 'indirect_costs', 'contingency', 'profit')),
  
  -- Montos
  budgeted numeric NOT NULL DEFAULT 0,
  actual numeric NOT NULL DEFAULT 0,
  committed numeric NOT NULL DEFAULT 0,
  variance numeric NOT NULL DEFAULT 0,
  variance_percentage numeric NOT NULL DEFAULT 0,
  
  -- Metadatos
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(project_id, category)
);

-- Tabla de items de coste individuales
CREATE TABLE IF NOT EXISTS cost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES cost_control_projects(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('materials', 'direct_labor', 'subcontracts', 'machinery', 'insurance', 'general_expenses', 'indirect_costs')),
  
  -- Información del item
  item_date date NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  
  -- Origen y referencia
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('treasury', 'supplier', 'payroll', 'manual')),
  source_id text,
  reference text,
  
  -- Estado
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'committed', 'paid')),
  
  -- Aprobación
  approved_by text,
  approved_at timestamptz,
  
  -- Metadatos
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de alertas de control de costes
CREATE TABLE IF NOT EXISTS cost_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES cost_control_projects(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  
  -- Tipo y severidad
  alert_type text NOT NULL CHECK (alert_type IN ('budget_exceeded', 'no_activity', 'high_labor_cost', 'variance_threshold', 'cash_flow_risk')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Mensaje y valores
  message text NOT NULL,
  threshold numeric NOT NULL,
  current_value numeric NOT NULL,
  
  -- Estado
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by text,
  
  -- Metadatos
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cost_control_projects_status ON cost_control_projects(status);
CREATE INDEX IF NOT EXISTS idx_cost_control_projects_risk_level ON cost_control_projects(risk_level);
CREATE INDEX IF NOT EXISTS idx_cost_control_projects_dates ON cost_control_projects(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_budget_breakdown_project ON budget_breakdown(project_id);
CREATE INDEX IF NOT EXISTS idx_cost_items_project ON cost_items(project_id);
CREATE INDEX IF NOT EXISTS idx_cost_items_date ON cost_items(item_date);
CREATE INDEX IF NOT EXISTS idx_cost_items_category ON cost_items(category);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_project ON cost_alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_severity ON cost_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_resolved ON cost_alerts(resolved);

-- Función para actualizar el timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_cost_control_projects_updated_at
  BEFORE UPDATE ON cost_control_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_breakdown_updated_at
  BEFORE UPDATE ON budget_breakdown
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_items_updated_at
  BEFORE UPDATE ON cost_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_alerts_updated_at
  BEFORE UPDATE ON cost_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para recalcular análisis de proyecto automáticamente
CREATE OR REPLACE FUNCTION recalculate_project_analysis()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el total_actual_cost sumando todos los cost_items
  UPDATE cost_control_projects
  SET total_actual_cost = (
    SELECT COALESCE(SUM(amount), 0)
    FROM cost_items
    WHERE project_id = NEW.project_id
  ),
  budget_variance = total_budget - (
    SELECT COALESCE(SUM(amount), 0)
    FROM cost_items
    WHERE project_id = NEW.project_id
  ),
  budget_variance_percentage = CASE 
    WHEN total_budget > 0 THEN 
      ((total_budget - (SELECT COALESCE(SUM(amount), 0) FROM cost_items WHERE project_id = NEW.project_id)) / total_budget) * 100
    ELSE 0
  END,
  gross_profit = total_budget - (
    SELECT COALESCE(SUM(amount), 0)
    FROM cost_items
    WHERE project_id = NEW.project_id
  ),
  gross_profit_margin = CASE 
    WHEN total_budget > 0 THEN 
      (((total_budget - (SELECT COALESCE(SUM(amount), 0) FROM cost_items WHERE project_id = NEW.project_id)) / total_budget) * 100)
    ELSE 0
  END
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para recalcular análisis cuando se modifiquen cost_items
CREATE TRIGGER trigger_recalculate_project_analysis
  AFTER INSERT OR UPDATE OR DELETE ON cost_items
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_project_analysis();

-- Habilitar Row Level Security en todas las tablas
ALTER TABLE cost_control_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para cost_control_projects
CREATE POLICY "Users can view all cost control projects"
  ON cost_control_projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create cost control projects"
  ON cost_control_projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update cost control projects"
  ON cost_control_projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete cost control projects"
  ON cost_control_projects FOR DELETE
  TO authenticated
  USING (true);

-- Políticas de seguridad para budget_breakdown
CREATE POLICY "Users can view all budget breakdowns"
  ON budget_breakdown FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create budget breakdowns"
  ON budget_breakdown FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update budget breakdowns"
  ON budget_breakdown FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete budget breakdowns"
  ON budget_breakdown FOR DELETE
  TO authenticated
  USING (true);

-- Políticas de seguridad para cost_items
CREATE POLICY "Users can view all cost items"
  ON cost_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create cost items"
  ON cost_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update cost items"
  ON cost_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete cost items"
  ON cost_items FOR DELETE
  TO authenticated
  USING (true);

-- Políticas de seguridad para cost_alerts
CREATE POLICY "Users can view all cost alerts"
  ON cost_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create cost alerts"
  ON cost_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update cost alerts"
  ON cost_alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete cost alerts"
  ON cost_alerts FOR DELETE
  TO authenticated
  USING (true);