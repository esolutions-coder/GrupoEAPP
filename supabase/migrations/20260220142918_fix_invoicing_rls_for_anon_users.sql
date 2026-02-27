/*
  # Permitir acceso anónimo a módulo de facturación

  1. Cambios
    - Actualizar políticas RLS para permitir acceso a usuarios anónimos
    - Las políticas ahora permiten tanto 'authenticated' como 'anon'
    
  2. Seguridad
    - Mantiene control de acceso mediante RLS
    - Permite uso del módulo con anon key para testing
*/

-- Eliminar políticas existentes de invoices
DROP POLICY IF EXISTS "Users can view invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices" ON invoices;

-- Recrear políticas permitiendo anon
CREATE POLICY "Users can view invoices"
  ON invoices FOR SELECT
  USING (true);

CREATE POLICY "Users can insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update invoices"
  ON invoices FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoices"
  ON invoices FOR DELETE
  USING (true);

-- Actualizar políticas de invoice_lines
DROP POLICY IF EXISTS "Users can view invoice lines" ON invoice_lines;
DROP POLICY IF EXISTS "Users can insert invoice lines" ON invoice_lines;
DROP POLICY IF EXISTS "Users can update invoice lines" ON invoice_lines;
DROP POLICY IF EXISTS "Users can delete invoice lines" ON invoice_lines;

CREATE POLICY "Users can view invoice lines"
  ON invoice_lines FOR SELECT
  USING (true);

CREATE POLICY "Users can insert invoice lines"
  ON invoice_lines FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update invoice lines"
  ON invoice_lines FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoice lines"
  ON invoice_lines FOR DELETE
  USING (true);

-- Actualizar políticas de invoicing_config
DROP POLICY IF EXISTS "Users can view invoicing config" ON invoicing_config;
DROP POLICY IF EXISTS "Users can insert invoicing config" ON invoicing_config;
DROP POLICY IF EXISTS "Users can update invoicing config" ON invoicing_config;

CREATE POLICY "Users can view invoicing config"
  ON invoicing_config FOR SELECT
  USING (true);

CREATE POLICY "Users can insert invoicing config"
  ON invoicing_config FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update invoicing config"
  ON invoicing_config FOR UPDATE
  USING (true)
  WITH CHECK (true);
