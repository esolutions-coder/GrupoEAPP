/*
  # Integración Mínima entre Módulos

  1. Objetivo
    Convertir client_id y crear funciones helper básicas.
*/

-- Convertir client_id de text a uuid en projects
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' 
    AND column_name = 'client_id' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE projects ALTER COLUMN client_id DROP NOT NULL;
    
    UPDATE projects
    SET client_id = NULL
    WHERE client_id IS NOT NULL 
    AND client_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    ALTER TABLE projects ALTER COLUMN client_id TYPE uuid USING client_id::uuid;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'projects_client_id_fkey'
    ) THEN
      ALTER TABLE projects
      ADD CONSTRAINT projects_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Funciones helper
CREATE OR REPLACE FUNCTION get_worker_full_name(worker_id uuid)
RETURNS text AS $$
BEGIN
  RETURN (SELECT COALESCE(first_name || ' ' || last_name, 'Desconocido') FROM workers WHERE id = worker_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_project_name(project_id uuid)
RETURNS text AS $$
BEGIN
  RETURN (SELECT COALESCE(name, 'Sin proyecto') FROM projects WHERE id = project_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_client_name(client_id uuid)
RETURNS text AS $$
BEGIN
  RETURN (SELECT COALESCE(name, 'Sin cliente') FROM clients WHERE id = client_id);
END;
$$ LANGUAGE plpgsql;

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_projects_client_id_uuid ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_work_report_details_worker ON work_report_details(worker_id);
CREATE INDEX IF NOT EXISTS idx_work_report_details_crew ON work_report_details(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_worker ON crew_members(worker_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_crew ON crew_members(crew_id);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_worker ON vacation_requests(worker_id);
CREATE INDEX IF NOT EXISTS idx_certifications_project ON certifications(project_id);
CREATE INDEX IF NOT EXISTS idx_project_measurements_project ON project_measurements(project_id);
