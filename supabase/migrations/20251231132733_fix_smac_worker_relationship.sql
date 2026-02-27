/*
  # Corrección de Relación SMAC con Trabajadores

  ## Cambios
  1. Añadir relación directa con la tabla workers
  2. Mantener campos adicionales específicos del SMAC
  3. Actualizar políticas de seguridad

  ## Notas
  - Se mantiene worker_name, worker_dni como campos de consulta rápida
  - Se añade worker_id como foreign key a workers
  - Se añade worker_category desde workers
*/

-- Añadir columna worker_id como foreign key si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'smac_records' AND column_name = 'worker_id'
  ) THEN
    ALTER TABLE smac_records ADD COLUMN worker_id uuid REFERENCES workers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Añadir columna worker_category si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'smac_records' AND column_name = 'worker_category'
  ) THEN
    ALTER TABLE smac_records ADD COLUMN worker_category text;
  END IF;
END $$;

-- Crear índice en worker_id para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_smac_records_worker_id ON smac_records(worker_id);

-- Añadir índice en worker_category
CREATE INDEX IF NOT EXISTS idx_smac_records_worker_category ON smac_records(worker_category);
