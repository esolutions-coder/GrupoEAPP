/*
  # Agregar columnas de unidad y certificación a origen

  1. Cambios
    - Agregar columna `unit` para la unidad de medida
    - Agregar columna `origin_quantity` para cantidad a origen
    - Agregar columna `previous_quantity` para cantidad anterior
    - Agregar columna `current_quantity` para cantidad actual (calculada)
    
  2. Notas
    - Estos campos son necesarios para el sistema de certificaciones a origen
    - current_quantity = origin_quantity - previous_quantity
*/

DO $$
BEGIN
  -- Agregar unit si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoice_lines' AND column_name = 'unit'
  ) THEN
    ALTER TABLE invoice_lines ADD COLUMN unit text DEFAULT 'ud';
  END IF;

  -- Agregar origin_quantity si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoice_lines' AND column_name = 'origin_quantity'
  ) THEN
    ALTER TABLE invoice_lines ADD COLUMN origin_quantity numeric DEFAULT 0;
  END IF;

  -- Agregar previous_quantity si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoice_lines' AND column_name = 'previous_quantity'
  ) THEN
    ALTER TABLE invoice_lines ADD COLUMN previous_quantity numeric DEFAULT 0;
  END IF;

  -- Agregar current_quantity si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoice_lines' AND column_name = 'current_quantity'
  ) THEN
    ALTER TABLE invoice_lines ADD COLUMN current_quantity numeric DEFAULT 0;
  END IF;
END $$;
