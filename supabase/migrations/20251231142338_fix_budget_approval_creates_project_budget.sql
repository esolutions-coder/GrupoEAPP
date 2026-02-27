/*
  # Corregir integración: Presupuestos → Proyecto con pestañas

  ## Problema
  Cuando se aprueba un presupuesto, se crea el proyecto automáticamente, pero:
  - NO aparece en la pestaña "Presupuesto" del módulo de Proyectos
  - NO aparece en la pestaña "Mediciones" del módulo de Proyectos  
  - NO aparece en la pestaña "Certificaciones" del módulo de Proyectos

  ## Solución
  Modificar el trigger para que al aprobar un presupuesto también:
  1. Cree una entrada en `project_budgets` (para pestaña Presupuesto)
  2. Cree entradas en `project_budget_items` (partidas del presupuesto)
  3. Cree entradas iniciales en `project_measurements` (para pestaña Mediciones)
  4. Las certificaciones se crearán manualmente después

  ## Flujo Completo
  1. Usuario aprueba presupuesto en módulo Presupuestos
  2. Trigger crea:
     - Proyecto en `projects`
     - Presupuesto en `project_budgets` (versión 1, aprobado)
     - Partidas en `project_budget_items` (copiadas del presupuesto)
     - Mediciones vacías en `project_measurements` (una por partida)
     - Capítulos/items en `measurement_chapters` y `measurement_items` (para control)
  3. Usuario puede ver todo en módulo Proyectos en sus respectivas pestañas
*/

-- Reemplazar función existente con una mejorada
CREATE OR REPLACE FUNCTION create_project_from_approved_budget()
RETURNS TRIGGER AS $$
DECLARE
  new_project_id uuid;
  new_project_budget_id uuid;
  budget_rec RECORD;
  chapter_rec RECORD;
  item_rec RECORD;
  new_chapter_id uuid;
  new_item_id uuid;
  project_code text;
  client_name_text text;
BEGIN
  -- Solo ejecutar si el estado cambia a 'approved' y no tiene proyecto generado
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.generated_project_id IS NULL AND NEW.can_generate_project = true THEN

    -- Obtener datos del presupuesto
    SELECT * INTO budget_rec FROM budgets WHERE id = NEW.id;

    -- Obtener nombre del cliente si existe
    IF budget_rec.client_id IS NOT NULL THEN
      SELECT name INTO client_name_text FROM clients WHERE id = budget_rec.client_id;
    END IF;

    -- Generar código del proyecto
    project_code := 'PRJ-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(random() * 1000)::text, 3, '0');

    -- 1. CREAR EL PROYECTO
    INSERT INTO projects (
      code,
      name,
      client_id,
      client_name,
      start_date,
      end_date,
      status,
      budget_id,
      created_from_budget,
      budget_total,
      total_budget,
      description
    ) VALUES (
      project_code,
      COALESCE('OBRA: ' || budget_rec.budget_code, 'Obra desde Presupuesto'),
      budget_rec.client_id,
      client_name_text,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '365 days',
      'planning',
      NEW.id,
      true,
      budget_rec.total,
      budget_rec.total,
      'Proyecto generado automáticamente desde presupuesto ' || COALESCE(budget_rec.budget_code, NEW.id::text)
    )
    RETURNING id INTO new_project_id;

    -- Actualizar el presupuesto con el proyecto generado
    UPDATE budgets
    SET generated_project_id = new_project_id
    WHERE id = NEW.id;

    -- 2. CREAR PRESUPUESTO EN PROJECT_BUDGETS (para pestaña Presupuesto del proyecto)
    INSERT INTO project_budgets (
      project_id,
      version,
      total_amount,
      status,
      approved_by,
      approved_at,
      notes
    ) VALUES (
      new_project_id,
      1,
      budget_rec.total,
      'approved',
      budget_rec.approved_by,
      budget_rec.approved_at,
      'Presupuesto importado desde: ' || COALESCE(budget_rec.budget_code, NEW.id::text)
    )
    RETURNING id INTO new_project_budget_id;

    -- 3. CREAR PARTIDAS EN PROJECT_BUDGET_ITEMS Y PROJECT_MEASUREMENTS
    FOR chapter_rec IN
      SELECT * FROM budget_chapters WHERE budget_id = NEW.id ORDER BY display_order
    LOOP
      -- Crear capítulo de medición (para control interno)
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

      -- Procesar cada item/partida del capítulo
      FOR item_rec IN
        SELECT * FROM budget_items
        WHERE budget_id = NEW.id AND chapter_id = chapter_rec.id
        ORDER BY display_order
      LOOP
        -- 3a. Crear partida en PROJECT_BUDGET_ITEMS (para pestaña Presupuesto)
        INSERT INTO project_budget_items (
          budget_id,
          chapter,
          item_code,
          description,
          unit,
          quantity,
          unit_price,
          total_price,
          order_index
        ) VALUES (
          new_project_budget_id,
          chapter_rec.chapter_name,
          item_rec.item_code,
          item_rec.description,
          item_rec.unit_of_measure,
          item_rec.estimated_quantity,
          item_rec.unit_price,
          item_rec.amount,
          item_rec.display_order
        )
        RETURNING id INTO new_item_id;

        -- 3b. Crear medición inicial en PROJECT_MEASUREMENTS (para pestaña Mediciones)
        INSERT INTO project_measurements (
          project_id,
          budget_item_id,
          measurement_date,
          chapter,
          description,
          planned_quantity,
          executed_quantity,
          unit,
          notes
        ) VALUES (
          new_project_id,
          new_item_id,
          CURRENT_DATE,
          chapter_rec.chapter_name,
          item_rec.description,
          item_rec.estimated_quantity,
          0, -- Sin ejecución inicial
          item_rec.unit_of_measure,
          'Medición inicial desde presupuesto aprobado'
        );

        -- 3c. Crear item de medición (para control interno de cantidades)
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

    RAISE NOTICE '✅ Proyecto % creado desde presupuesto % con presupuesto, partidas y mediciones', new_project_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger (asegura que use la función actualizada)
DROP TRIGGER IF EXISTS trigger_create_project_from_budget ON budgets;
CREATE TRIGGER trigger_create_project_from_budget
  AFTER UPDATE ON budgets
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
  EXECUTE FUNCTION create_project_from_approved_budget();

-- Comentarios
COMMENT ON FUNCTION create_project_from_approved_budget IS 
'Crea proyecto completo desde presupuesto aprobado incluyendo:
- Proyecto en projects
- Presupuesto en project_budgets (pestaña Presupuesto)
- Partidas en project_budget_items (pestaña Presupuesto)
- Mediciones iniciales en project_measurements (pestaña Mediciones)
- Capítulos/items de control en measurement_chapters/measurement_items';
