/*
  # Corregir creación de proyecto desde presupuesto aprobado

  1. Problema
    - El trigger create_project_from_approved_budget() no genera el campo 'code' requerido
    - La tabla projects tiene 'code' como NOT NULL
    - Causa error: "null value in column "code" of relation "projects" violates not-null constraint"

  2. Solución
    - Modificar trigger para generar código automático basado en presupuesto
    - Agregar todos los campos requeridos de la tabla projects
    - Formato: PROY-[CODIGO_PRESUPUESTO] o generar secuencial

  3. Cambios
    - Actualizar función create_project_from_approved_budget()
    - Agregar generación de 'code', 'client_name', 'responsible', 'estimated_end_date'
*/

CREATE OR REPLACE FUNCTION create_project_from_approved_budget()
RETURNS TRIGGER AS $$
DECLARE
  new_project_id uuid;
  budget_rec RECORD;
  chapter_rec RECORD;
  item_rec RECORD;
  new_chapter_id uuid;
  new_item_id uuid;
  project_code text;
  client_name_var text;
BEGIN
  -- Solo ejecutar si el estado cambia a 'approved' y no tiene proyecto generado
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.generated_project_id IS NULL AND NEW.can_generate_project = true THEN

    -- Obtener datos del presupuesto
    SELECT * INTO budget_rec FROM budgets WHERE id = NEW.id;

    -- Generar código de proyecto
    project_code := 'PROY-' || budget_rec.budget_code;

    -- Obtener nombre del cliente
    SELECT commercial_name INTO client_name_var
    FROM clients
    WHERE id = budget_rec.client_id;

    -- Si no se encuentra cliente, usar valor por defecto
    IF client_name_var IS NULL THEN
      client_name_var := 'Cliente desde presupuesto';
    END IF;

    -- Crear el proyecto con TODOS los campos requeridos
    INSERT INTO projects (
      name,
      code,
      description,
      location,
      client_id,
      client_name,
      responsible,
      start_date,
      end_date,
      estimated_end_date,
      status,
      budget_id,
      created_from_budget,
      budget_total,
      total_budget
    ) VALUES (
      'OBRA: ' || budget_rec.budget_code,
      project_code,
      'Proyecto generado automáticamente desde presupuesto ' || budget_rec.budget_code,
      'Por definir',
      budget_rec.client_id,
      client_name_var,
      budget_rec.contractor,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '365 days',
      CURRENT_DATE + INTERVAL '365 days',
      'planning',
      NEW.id,
      true,
      budget_rec.total,
      budget_rec.total
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

    -- Actualizar NEW para reflejar el cambio
    NEW.generated_project_id := new_project_id;

    RAISE NOTICE 'Proyecto % creado exitosamente desde presupuesto %', new_project_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
DROP TRIGGER IF EXISTS trigger_create_project_on_budget_approval ON budgets;
CREATE TRIGGER trigger_create_project_on_budget_approval
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION create_project_from_approved_budget();
