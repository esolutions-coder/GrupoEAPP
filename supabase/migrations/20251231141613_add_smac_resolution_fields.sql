/*
  # Agregar campos de resolución y acuerdo al módulo SMAC

  ## Cambios
  1. Agregar campos para controlar acuerdos y pagos en smac_records:
     - agreement_reached: boolean - Si se llegó a un acuerdo
     - agreement_amount: decimal - Importe del acuerdo alcanzado
     - actual_paid_amount: decimal - Cantidad realmente pagada (si no fue favorable)
     - is_favorable: boolean - Si la resolución fue favorable para la empresa
     - deviation_amount: decimal (generado) - Desviación entre reclamado y pagado

  2. Actualizar trigger para calcular automáticamente:
     - total_cost (incluir actual_paid_amount)
     - deviation_amount

  ## Notas
  - Los campos permiten diferenciar entre acuerdos (agreement_amount) y pagos forzados (actual_paid_amount)
  - is_favorable indica si el resultado fue positivo para la empresa
  - deviation_amount se calcula automáticamente: actual_paid_amount - claimed_amount
*/

-- Agregar nuevos campos a smac_records
DO $$ 
BEGIN
  -- Campo para indicar si se llegó a un acuerdo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smac_records' AND column_name = 'agreement_reached'
  ) THEN
    ALTER TABLE smac_records ADD COLUMN agreement_reached boolean DEFAULT false;
  END IF;

  -- Importe del acuerdo alcanzado (si se concilió)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smac_records' AND column_name = 'agreement_amount'
  ) THEN
    ALTER TABLE smac_records ADD COLUMN agreement_amount decimal(12, 2) DEFAULT 0;
  END IF;

  -- Cantidad realmente pagada (puede ser por acuerdo o sentencia)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smac_records' AND column_name = 'actual_paid_amount'
  ) THEN
    ALTER TABLE smac_records ADD COLUMN actual_paid_amount decimal(12, 2) DEFAULT 0;
  END IF;

  -- Indica si la resolución fue favorable para la empresa
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smac_records' AND column_name = 'is_favorable'
  ) THEN
    ALTER TABLE smac_records ADD COLUMN is_favorable boolean DEFAULT NULL;
  END IF;

  -- Desviación entre lo reclamado y lo pagado (calculado automáticamente)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smac_records' AND column_name = 'deviation_amount'
  ) THEN
    ALTER TABLE smac_records ADD COLUMN deviation_amount decimal(12, 2) DEFAULT 0;
  END IF;
END $$;

-- Función para calcular automáticamente campos derivados
CREATE OR REPLACE FUNCTION calculate_smac_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular desviación: pagado - reclamado (negativo = ahorro, positivo = sobrecosto)
  NEW.deviation_amount := COALESCE(NEW.actual_paid_amount, 0) - COALESCE(NEW.claimed_amount, 0);
  
  -- Calcular coste total: costes legales + tasas judiciales + costes de liquidación + cantidad pagada
  NEW.total_cost := 
    COALESCE(NEW.legal_costs, 0) + 
    COALESCE(NEW.court_fees, 0) + 
    COALESCE(NEW.settlement_costs, 0) + 
    COALESCE(NEW.actual_paid_amount, 0);
  
  -- Si se llegó a acuerdo, copiar agreement_amount a actual_paid_amount si no está definido
  IF NEW.agreement_reached = true AND NEW.agreement_amount IS NOT NULL AND 
     (NEW.actual_paid_amount IS NULL OR NEW.actual_paid_amount = 0) THEN
    NEW.actual_paid_amount := NEW.agreement_amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para calcular totales automáticamente
DROP TRIGGER IF EXISTS trigger_calculate_smac_totals ON smac_records;
CREATE TRIGGER trigger_calculate_smac_totals
  BEFORE INSERT OR UPDATE ON smac_records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_smac_totals();

-- Comentarios en las columnas
COMMENT ON COLUMN smac_records.agreement_reached IS 'Indica si se llegó a un acuerdo con el trabajador';
COMMENT ON COLUMN smac_records.agreement_amount IS 'Importe del acuerdo alcanzado en conciliación';
COMMENT ON COLUMN smac_records.actual_paid_amount IS 'Cantidad realmente pagada (por acuerdo o sentencia)';
COMMENT ON COLUMN smac_records.is_favorable IS 'Indica si la resolución fue favorable para la empresa (true) o desfavorable (false)';
COMMENT ON COLUMN smac_records.deviation_amount IS 'Desviación entre cantidad reclamada y pagada (calculado automáticamente)';
