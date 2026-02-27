/*
  # Tabla de Proyectos/Obras

  1. Nueva Tabla
    - `projects`
      - Almacena información completa de proyectos/obras
      - Esta es la tabla maestra de proyectos utilizada por múltiples módulos
      - Campos: id, name, code, client info, dates, status, responsible, location, etc.

  2. Modificación
    - Modificar `cost_control_projects` para referenciar a `projects`
      - Agregar foreign key a projects
      - El módulo de control de costes consumirá proyectos desde aquí

  3. Seguridad
    - Habilitar RLS en projects
    - Políticas para usuarios autenticados

  4. Índices
    - Índices en campos de búsqueda frecuente
*/

-- Crear tabla de proyectos
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  location text,
  
  -- Cliente
  client_id text NOT NULL,
  client_name text NOT NULL,
  
  -- Responsable y gestión
  responsible text NOT NULL,
  project_manager text,
  
  -- Fechas
  start_date date NOT NULL,
  end_date date NOT NULL,
  estimated_end_date date NOT NULL,
  
  -- Estado
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Presupuesto total (del presupuesto de proyecto)
  total_budget numeric DEFAULT 0,
  
  -- Tarifas administrativas
  admin_hourly_rate_workers numeric DEFAULT 25.00,
  admin_hourly_rate_machinery numeric DEFAULT 45.00,
  
  -- Metadatos
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text,
  updated_by text
);

-- Crear índices para projects
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);

-- Trigger para updated_at en projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Modificar cost_control_projects para agregar relación con projects
DO $$
BEGIN
  -- Primero eliminar la constraint unique en project_id si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cost_control_projects_project_id_key' 
    AND table_name = 'cost_control_projects'
  ) THEN
    ALTER TABLE cost_control_projects DROP CONSTRAINT cost_control_projects_project_id_key;
  END IF;

  -- Cambiar el tipo de project_id de text a uuid si es necesario
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cost_control_projects' 
    AND column_name = 'project_id' 
    AND data_type = 'text'
  ) THEN
    -- Primero eliminar datos existentes para evitar conflictos de conversión
    DELETE FROM cost_control_projects;
    
    -- Cambiar tipo de columna
    ALTER TABLE cost_control_projects ALTER COLUMN project_id TYPE uuid USING NULL;
  END IF;

  -- Agregar foreign key constraint si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cost_control_projects_project_id_fkey' 
    AND table_name = 'cost_control_projects'
  ) THEN
    ALTER TABLE cost_control_projects 
    ADD CONSTRAINT cost_control_projects_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  -- Hacer project_id NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cost_control_projects' 
    AND column_name = 'project_id' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE cost_control_projects ALTER COLUMN project_id SET NOT NULL;
  END IF;
  
  -- Agregar unique constraint de nuevo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cost_control_projects_project_id_key' 
    AND table_name = 'cost_control_projects'
  ) THEN
    ALTER TABLE cost_control_projects ADD CONSTRAINT cost_control_projects_project_id_key UNIQUE(project_id);
  END IF;
END $$;

-- Habilitar RLS en projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para projects
CREATE POLICY "Users can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);