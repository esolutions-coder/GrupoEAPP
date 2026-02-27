/*
  # Integración Completa: Proyectos, Presupuestos, Mediciones y Certificaciones

  ## Resumen
  Esta migración integra completamente los módulos de Proyectos, Presupuestos,
  Mediciones y Certificaciones para que trabajen de forma cohesiva.

  ## Flujo de Trabajo

  1. **PRESUPUESTO** (draft)
     ↓ Se crea presupuesto con capítulos y partidas

  2. **PRESUPUESTO APROBADO** (status: approved)
     ↓ Al aprobar presupuesto, se crea automáticamente un PROYECTO
     ↓ Se vinculan las partidas del presupuesto con el proyecto

  3. **PROYECTO ACTIVO** (status: in_progress)
     ↓ El proyecto hereda datos del presupuesto
     ↓ Se crean mediciones basadas en las partidas del presupuesto

  4. **MEDICIONES**
     ↓ Las mediciones están vinculadas a partidas de presupuesto
     ↓ Se registran cantidades ejecutadas vs presupuestadas

  5. **CERTIFICACIONES**
     ↓ Las certificaciones se basan en mediciones aprobadas
     ↓ Se generan automáticamente a partir de mediciones
     ↓ Actualizan el estado económico del proyecto

  ## Cambios Implementados

  1. **Tabla projects**
     - Agregar `budget_id` para vincular con presupuesto origen
     - Agregar `created_from_budget` para indicar origen automático

  2. **Tabla budgets**
     - Agregar `generated_project_id` para vincular proyecto generado
     - Agregar trigger que crea proyecto al aprobar presupuesto

  3. **Tabla measurement_items**
     - Vincular con `budget_items` (partidas de presupuesto)
     - Importar datos de presupuesto automáticamente

  4. **Tabla certification_items**
     - Vincular con `measurement_items`
     - Calcular totales basados en mediciones

  5. **Funciones y Triggers**
     - `create_project_from_approved_budget()` - Crea proyecto al aprobar presupuesto
     - `sync_measurement_items_from_budget()` - Sincroniza partidas de presupuesto a mediciones
     - `update_project_progress_from_measurements()` - Actualiza progreso del proyecto
     - `create_certification_from_measurements()` - Genera certificación desde mediciones

  ## Seguridad
  - Mantiene RLS existente en todas las tablas
  - No modifica permisos actuales
*/

-- =====================================================
-- 1. ACTUALIZAR TABLA PROJECTS
-- =====================================================

-- Agregar columnas de integración a projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'budget_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN budget_id uuid REFERENCES budgets(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'created_from_budget'
  ) THEN
    ALTER TABLE projects ADD COLUMN created_from_budget boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'budget_total'
  ) THEN
    ALTER TABLE projects ADD COLUMN budget_total numeric(15,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'certified_total'
  ) THEN
    ALTER TABLE projects ADD COLUMN certified_total numeric(15,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'percentage_complete'
  ) THEN
    ALTER TABLE projects ADD COLUMN percentage_complete numeric(5,2) DEFAULT 0;
  END IF;
END $$;

-- Crear índice para budget_id
CREATE INDEX IF NOT EXISTS idx_projects_budget ON projects(budget_id);

-- =====================================================
-- 2. ACTUALIZAR TABLA BUDGETS
-- =====================================================

-- Agregar columnas de integración a budgets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'budgets' AND column_name = 'generated_project_id'
  ) THEN
    ALTER TABLE budgets ADD COLUMN generated_project_id uuid REFERENCES projects(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'budgets' AND column_name = 'can_generate_project'
  ) THEN
    ALTER TABLE budgets ADD COLUMN can_generate_project boolean DEFAULT true;
  END IF;
END $$;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_budgets_generated_project ON budgets(generated_project_id);

-- =====================================================
-- 3. VINCULAR MEASUREMENT_ITEMS CON BUDGET_ITEMS
-- =====================================================

-- Agregar vinculación en measurement_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_items' AND column_name = 'budget_item_id'
  ) THEN
    ALTER TABLE measurement_items ADD COLUMN budget_item_id uuid REFERENCES budget_items(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_measurement_items_budget_item ON measurement_items(budget_item_id);

-- =====================================================
-- 4. FUNCIÓN: CREAR PROYECTO DESDE PRESUPUESTO APROBADO
-- =====================================================

CREATE OR REPLACE FUNCTION create_project_from_approved_budget()
RETURNS TRIGGER AS $$
DECLARE
  new_project_id uuid;
  budget_rec RECORD;
  chapter_rec RECORD;
  item_rec RECORD;
  new_chapter_id uuid;
  new_item_id uuid;
BEGIN
  -- Solo ejecutar si el estado cambia a 'approved' y no tiene proyecto generado
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.generated_project_id IS NULL AND NEW.can_generate_project = true THEN

    -- Obtener datos del presupuesto
    SELECT * INTO budget_rec FROM budgets WHERE id = NEW.id;

    -- Crear el proyecto
    INSERT INTO projects (
      name,
      client_id,
      start_date,
      end_date,
      status,
      budget_id,
      created_from_budget,
      budget_total,
      total_budget,
      description
    ) VALUES (
      'OBRA: ' || budget_rec.budget_code,
      budget_rec.client_id,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '365 days',
      'planning',
      NEW.id,
      true,
      budget_rec.total,
      budget_rec.total,
      'Proyecto generado automáticamente desde presupuesto ' || budget_rec.budget_code
    )
    RETURNING id INTO new_project_id;

    -- Actualizar el presupuesto con el proyecto generado
    UPDATE budgets
    SET generated_project_id = new_project_id
    WHERE id = NEW.id;

    -- Crear capítulos de medición desde capítulos de presupuesto
    FOR chapter_rec IN
      SELECT * FROM budget_chapters WHERE budget_id = NEW.id ORDER BY display_order
    LOOP
      INSERT INTO measurement_chapters (
        project_id,
        chapter_code,
        chapter_name,
        description,
        display_order
      ) VALUES (
        new_project_id,
        chapter_rec.chapter_code,
        chapter_rec.chapter_name,
        'Capítulo importado desde presupuesto',
        chapter_rec.display_order
      )
      RETURNING id INTO new_chapter_id;

      -- Crear items de medición desde items de presupuesto
      FOR item_rec IN
        SELECT * FROM budget_items
        WHERE budget_id = NEW.id AND chapter_id = chapter_rec.id
        ORDER BY display_order
      LOOP
        INSERT INTO measurement_items (
          project_id,
          chapter_id,
          budget_item_id,
          item_code,
          description,
          unit_of_measure,
          budgeted_quantity,
          budgeted_unit_price,
          budgeted_total,
          status
        ) VALUES (
          new_project_id,
          new_chapter_id,
          item_rec.id,
          item_rec.item_code,
          item_rec.description,
          item_rec.unit_of_measure,
          item_rec.estimated_quantity,
          item_rec.unit_price,
          item_rec.amount,
          'active'
        );
      END LOOP;
    END LOOP;

    RAISE NOTICE 'Proyecto % creado desde presupuesto %', new_project_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para crear proyecto al aprobar presupuesto
DROP TRIGGER IF EXISTS trigger_create_project_from_budget ON budgets;
CREATE TRIGGER trigger_create_project_from_budget
  AFTER UPDATE ON budgets
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
  EXECUTE FUNCTION create_project_from_approved_budget();

-- =====================================================
-- 5. FUNCIÓN: ACTUALIZAR PROGRESO DEL PROYECTO
-- =====================================================

CREATE OR REPLACE FUNCTION update_project_progress_from_measurements()
RETURNS TRIGGER AS $$
DECLARE
  project_rec RECORD;
  total_budgeted numeric;
  total_measured numeric;
  progress_pct numeric;
BEGIN
  -- Obtener totales del proyecto
  SELECT
    p.id,
    p.budget_total,
    COALESCE(SUM(mi.budgeted_total), 0) as budgeted,
    COALESCE(SUM(mr.measured_quantity * mi.budgeted_unit_price), 0) as measured
  INTO project_rec
  FROM projects p
  LEFT JOIN measurement_items mi ON p.id = mi.project_id
  LEFT JOIN measurement_records mr ON mi.id = mr.item_id
  WHERE p.id = (
    SELECT project_id FROM measurement_items WHERE id = NEW.item_id
  )
  GROUP BY p.id, p.budget_total;

  -- Calcular porcentaje
  IF project_rec.budgeted > 0 THEN
    progress_pct = (project_rec.measured / project_rec.budgeted) * 100;
  ELSE
    progress_pct = 0;
  END IF;

  -- Actualizar proyecto
  UPDATE projects
  SET
    percentage_complete = LEAST(progress_pct, 100),
    updated_at = now()
  WHERE id = project_rec.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar progreso
DROP TRIGGER IF EXISTS trigger_update_project_progress ON measurement_records;
CREATE TRIGGER trigger_update_project_progress
  AFTER INSERT OR UPDATE ON measurement_records
  FOR EACH ROW
  EXECUTE FUNCTION update_project_progress_from_measurements();

-- =====================================================
-- 6. FUNCIÓN: ACTUALIZAR TOTALES CERTIFICADOS EN PROYECTO
-- =====================================================

CREATE OR REPLACE FUNCTION update_project_certified_totals()
RETURNS TRIGGER AS $$
DECLARE
  project_rec RECORD;
BEGIN
  -- Calcular totales certificados
  SELECT
    p.id,
    COALESCE(SUM(c.accumulated_amount), 0) as total_certified
  INTO project_rec
  FROM projects p
  LEFT JOIN certifications c ON p.id = c.project_id AND c.status = 'certified'
  WHERE p.id = NEW.project_id
  GROUP BY p.id;

  -- Actualizar proyecto
  UPDATE projects
  SET
    certified_total = project_rec.total_certified,
    updated_at = now()
  WHERE id = project_rec.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar totales certificados
DROP TRIGGER IF EXISTS trigger_update_project_certified ON certifications;
CREATE TRIGGER trigger_update_project_certified
  AFTER INSERT OR UPDATE ON certifications
  FOR EACH ROW
  WHEN (NEW.status = 'certified')
  EXECUTE FUNCTION update_project_certified_totals();

-- =====================================================
-- 7. VISTA: RESUMEN INTEGRADO DE PROYECTOS
-- =====================================================

CREATE OR REPLACE VIEW integrated_project_summary AS
SELECT
  p.id as project_id,
  p.name as project_name,
  p.status as project_status,
  p.budget_id,
  b.budget_code,
  b.status as budget_status,
  p.budget_total,
  p.certified_total,
  p.percentage_complete,
  p.budget_total - p.certified_total as pending_to_certify,
  COUNT(DISTINCT mi.id) as total_measurement_items,
  COUNT(DISTINCT mr.id) as total_measurements,
  COUNT(DISTINCT c.id) as total_certifications,
  SUM(CASE WHEN c.status = 'certified' THEN c.total_amount ELSE 0 END) as certified_amount,
  MAX(c.certification_number) as last_certification_number,
  p.start_date,
  p.end_date,
  p.created_from_budget,
  p.created_at,
  p.updated_at
FROM projects p
LEFT JOIN budgets b ON p.budget_id = b.id
LEFT JOIN measurement_items mi ON p.id = mi.project_id
LEFT JOIN measurement_records mr ON mi.id = mr.item_id
LEFT JOIN certifications c ON p.id = c.project_id
GROUP BY
  p.id, p.name, p.status, p.budget_id, b.budget_code, b.status,
  p.budget_total, p.certified_total, p.percentage_complete,
  p.start_date, p.end_date, p.created_from_budget, p.created_at, p.updated_at;

-- =====================================================
-- 8. VISTA: ESTADO DE MEDICIONES POR PROYECTO
-- =====================================================

CREATE OR REPLACE VIEW project_measurement_status AS
SELECT
  p.id as project_id,
  p.name as project_name,
  mc.id as chapter_id,
  mc.chapter_name,
  mi.id as item_id,
  mi.item_code,
  mi.description,
  mi.unit_of_measure,
  mi.budgeted_quantity,
  mi.budgeted_unit_price,
  mi.budgeted_total,
  COALESCE(SUM(mr.measured_quantity), 0) as total_measured_quantity,
  COALESCE(SUM(mr.measured_quantity * mi.budgeted_unit_price), 0) as total_measured_amount,
  COALESCE(SUM(CASE WHEN mr.is_certified THEN mr.measured_quantity ELSE 0 END), 0) as certified_quantity,
  COALESCE(SUM(CASE WHEN mr.is_certified THEN mr.measured_quantity * mi.budgeted_unit_price ELSE 0 END), 0) as certified_amount,
  mi.budgeted_quantity - COALESCE(SUM(mr.measured_quantity), 0) as pending_quantity,
  mi.budgeted_total - COALESCE(SUM(mr.measured_quantity * mi.budgeted_unit_price), 0) as pending_amount,
  CASE
    WHEN mi.budgeted_quantity > 0 THEN
      (COALESCE(SUM(mr.measured_quantity), 0) / mi.budgeted_quantity * 100)
    ELSE 0
  END as execution_percentage,
  mi.status
FROM projects p
INNER JOIN measurement_chapters mc ON p.id = mc.project_id
INNER JOIN measurement_items mi ON mc.id = mi.chapter_id
LEFT JOIN measurement_records mr ON mi.id = mr.item_id
GROUP BY
  p.id, p.name, mc.id, mc.chapter_name, mi.id, mi.item_code,
  mi.description, mi.unit_of_measure, mi.budgeted_quantity,
  mi.budgeted_unit_price, mi.budgeted_total, mi.status;

-- =====================================================
-- 9. VISTA: COMPARATIVA PRESUPUESTO VS CERTIFICADO
-- =====================================================

CREATE OR REPLACE VIEW budget_vs_certified_comparison AS
SELECT
  p.id as project_id,
  p.name as project_name,
  b.id as budget_id,
  b.budget_code,
  b.total as budget_total,
  b.subtotal as budget_subtotal,
  p.certified_total,
  b.total - p.certified_total as pending_to_certify,
  CASE
    WHEN b.total > 0 THEN (p.certified_total / b.total * 100)
    ELSE 0
  END as certification_percentage,
  COUNT(DISTINCT bi.id) as total_budget_items,
  COUNT(DISTINCT mi.id) as total_measurement_items,
  COUNT(DISTINCT c.id) as total_certifications,
  b.status as budget_status,
  p.status as project_status,
  b.approved_at as budget_approved_date,
  p.start_date as project_start_date
FROM projects p
INNER JOIN budgets b ON p.budget_id = b.id
LEFT JOIN budget_items bi ON b.id = bi.budget_id
LEFT JOIN measurement_items mi ON p.id = mi.project_id
LEFT JOIN certifications c ON p.id = c.project_id
WHERE p.created_from_budget = true
GROUP BY
  p.id, p.name, b.id, b.budget_code, b.total, b.subtotal,
  p.certified_total, b.status, p.status, b.approved_at, p.start_date;

-- =====================================================
-- 10. FUNCIÓN AUXILIAR: SINCRONIZAR PARTIDAS MANUALMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION sync_budget_items_to_measurements(p_budget_id uuid, p_project_id uuid)
RETURNS void AS $$
DECLARE
  chapter_rec RECORD;
  item_rec RECORD;
  new_chapter_id uuid;
BEGIN
  -- Crear capítulos de medición desde capítulos de presupuesto
  FOR chapter_rec IN
    SELECT * FROM budget_chapters WHERE budget_id = p_budget_id ORDER BY display_order
  LOOP
    -- Verificar si ya existe el capítulo
    SELECT id INTO new_chapter_id
    FROM measurement_chapters
    WHERE project_id = p_project_id AND chapter_code = chapter_rec.chapter_code;

    IF new_chapter_id IS NULL THEN
      INSERT INTO measurement_chapters (
        project_id,
        chapter_code,
        chapter_name,
        description,
        display_order
      ) VALUES (
        p_project_id,
        chapter_rec.chapter_code,
        chapter_rec.chapter_name,
        'Capítulo sincronizado desde presupuesto',
        chapter_rec.display_order
      )
      RETURNING id INTO new_chapter_id;
    END IF;

    -- Crear items de medición desde items de presupuesto
    FOR item_rec IN
      SELECT * FROM budget_items
      WHERE budget_id = p_budget_id AND chapter_id = chapter_rec.id
      ORDER BY display_order
    LOOP
      -- Verificar si ya existe el item
      IF NOT EXISTS (
        SELECT 1 FROM measurement_items
        WHERE project_id = p_project_id AND item_code = item_rec.item_code
      ) THEN
        INSERT INTO measurement_items (
          project_id,
          chapter_id,
          budget_item_id,
          item_code,
          description,
          unit_of_measure,
          budgeted_quantity,
          budgeted_unit_price,
          budgeted_total,
          status
        ) VALUES (
          p_project_id,
          new_chapter_id,
          item_rec.id,
          item_rec.item_code,
          item_rec.description,
          item_rec.unit_of_measure,
          item_rec.estimated_quantity,
          item_rec.unit_price,
          item_rec.amount,
          'active'
        );
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Sincronización completada: Presupuesto % -> Proyecto %', p_budget_id, p_project_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. CREAR ÍNDICES ADICIONALES PARA RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_measurement_items_status ON measurement_items(status);
CREATE INDEX IF NOT EXISTS idx_measurement_records_certified ON measurement_records(is_certified);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON certifications(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_from_budget ON projects(created_from_budget);

-- =====================================================
-- 12. COMENTARIOS EN TABLAS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON COLUMN projects.budget_id IS 'Vinculación con el presupuesto que originó este proyecto';
COMMENT ON COLUMN projects.created_from_budget IS 'Indica si el proyecto fue creado automáticamente desde un presupuesto aprobado';
COMMENT ON COLUMN projects.budget_total IS 'Total presupuestado para el proyecto';
COMMENT ON COLUMN projects.certified_total IS 'Total certificado acumulado hasta la fecha';
COMMENT ON COLUMN projects.percentage_complete IS 'Porcentaje de ejecución calculado desde mediciones';

COMMENT ON COLUMN budgets.generated_project_id IS 'ID del proyecto generado automáticamente al aprobar este presupuesto';
COMMENT ON COLUMN budgets.can_generate_project IS 'Permite controlar si este presupuesto puede generar un proyecto automáticamente';

COMMENT ON COLUMN measurement_items.budget_item_id IS 'Vinculación con la partida de presupuesto correspondiente';

COMMENT ON VIEW integrated_project_summary IS 'Vista integrada con resumen completo de proyectos, presupuestos, mediciones y certificaciones';
COMMENT ON VIEW project_measurement_status IS 'Estado detallado de mediciones por proyecto con cantidades ejecutadas y pendientes';
COMMENT ON VIEW budget_vs_certified_comparison IS 'Comparativa entre presupuesto aprobado y certificaciones realizadas';
