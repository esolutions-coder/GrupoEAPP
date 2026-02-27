/*
  # Agregar campos faltantes a certificaciones

  1. Cambios
    - Agregar campo `base_amount` para la base imponible
    - Agregar campo `iva_rate` para el porcentaje de IVA
    - Agregar campo `iva_amount` para el importe de IVA
    - Agregar campo `retention_rate` para el porcentaje de retención
    - Agregar campo `previous_accumulated` para el acumulado anterior
    - Agregar campo `description` para descripción
    
  2. Notas
    - Estos campos son necesarios para la gestión completa de certificaciones
    - Compatible con el módulo actualizado de certificaciones
*/

DO $$
BEGIN
  -- Agregar base_amount si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certifications' AND column_name = 'base_amount'
  ) THEN
    ALTER TABLE certifications ADD COLUMN base_amount numeric DEFAULT 0;
  END IF;

  -- Agregar iva_rate si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certifications' AND column_name = 'iva_rate'
  ) THEN
    ALTER TABLE certifications ADD COLUMN iva_rate numeric DEFAULT 21;
  END IF;

  -- Agregar iva_amount si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certifications' AND column_name = 'iva_amount'
  ) THEN
    ALTER TABLE certifications ADD COLUMN iva_amount numeric DEFAULT 0;
  END IF;

  -- Agregar retention_rate si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certifications' AND column_name = 'retention_rate'
  ) THEN
    ALTER TABLE certifications ADD COLUMN retention_rate numeric DEFAULT 5;
  END IF;

  -- Agregar previous_accumulated si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certifications' AND column_name = 'previous_accumulated'
  ) THEN
    ALTER TABLE certifications ADD COLUMN previous_accumulated numeric DEFAULT 0;
  END IF;

  -- Agregar description si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certifications' AND column_name = 'description'
  ) THEN
    ALTER TABLE certifications ADD COLUMN description text DEFAULT '';
  END IF;
END $$;
