/*
  # Corregir todas las políticas RLS del módulo de facturación

  1. Cambios
    - Actualizar TODAS las políticas del módulo de facturación para permitir acceso sin restricciones
    - Esto incluye: invoices, invoice_lines, invoice_guarantees, invoice_payments, monthly_closings, invoicing_config
    
  2. Seguridad
    - Permite uso con anon key para testing/desarrollo
    - Las políticas usan USING (true) para permitir acceso completo
*/

-- ============================================================================
-- INVOICES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices" ON invoices;

CREATE POLICY "Users can view invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Users can insert invoices" ON invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update invoices" ON invoices FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Users can delete invoices" ON invoices FOR DELETE USING (true);

-- ============================================================================
-- INVOICE_LINES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view invoice lines" ON invoice_lines;
DROP POLICY IF EXISTS "Users can insert invoice lines" ON invoice_lines;
DROP POLICY IF EXISTS "Users can update invoice lines" ON invoice_lines;
DROP POLICY IF EXISTS "Users can delete invoice lines" ON invoice_lines;

CREATE POLICY "Users can view invoice lines" ON invoice_lines FOR SELECT USING (true);
CREATE POLICY "Users can insert invoice lines" ON invoice_lines FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update invoice lines" ON invoice_lines FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Users can delete invoice lines" ON invoice_lines FOR DELETE USING (true);

-- ============================================================================
-- INVOICE_GUARANTEES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view invoice guarantees" ON invoice_guarantees;
DROP POLICY IF EXISTS "Users can insert invoice guarantees" ON invoice_guarantees;
DROP POLICY IF EXISTS "Users can update invoice guarantees" ON invoice_guarantees;
DROP POLICY IF EXISTS "Users can delete invoice guarantees" ON invoice_guarantees;

CREATE POLICY "Users can view invoice guarantees" ON invoice_guarantees FOR SELECT USING (true);
CREATE POLICY "Users can insert invoice guarantees" ON invoice_guarantees FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update invoice guarantees" ON invoice_guarantees FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Users can delete invoice guarantees" ON invoice_guarantees FOR DELETE USING (true);

-- ============================================================================
-- INVOICE_PAYMENTS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view invoice payments" ON invoice_payments;
DROP POLICY IF EXISTS "Users can insert invoice payments" ON invoice_payments;
DROP POLICY IF EXISTS "Users can update invoice payments" ON invoice_payments;
DROP POLICY IF EXISTS "Users can delete invoice payments" ON invoice_payments;

CREATE POLICY "Users can view invoice payments" ON invoice_payments FOR SELECT USING (true);
CREATE POLICY "Users can insert invoice payments" ON invoice_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update invoice payments" ON invoice_payments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Users can delete invoice payments" ON invoice_payments FOR DELETE USING (true);

-- ============================================================================
-- MONTHLY_CLOSINGS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view monthly closings" ON monthly_closings;
DROP POLICY IF EXISTS "Users can insert monthly closings" ON monthly_closings;
DROP POLICY IF EXISTS "Users can update monthly closings" ON monthly_closings;
DROP POLICY IF EXISTS "Users can delete monthly closings" ON monthly_closings;

CREATE POLICY "Users can view monthly closings" ON monthly_closings FOR SELECT USING (true);
CREATE POLICY "Users can insert monthly closings" ON monthly_closings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update monthly closings" ON monthly_closings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Users can delete monthly closings" ON monthly_closings FOR DELETE USING (true);

-- ============================================================================
-- INVOICING_CONFIG
-- ============================================================================
DROP POLICY IF EXISTS "Users can view invoicing config" ON invoicing_config;
DROP POLICY IF EXISTS "Users can insert invoicing config" ON invoicing_config;
DROP POLICY IF EXISTS "Users can update invoicing config" ON invoicing_config;
DROP POLICY IF EXISTS "Users can delete invoicing config" ON invoicing_config;

CREATE POLICY "Users can view invoicing config" ON invoicing_config FOR SELECT USING (true);
CREATE POLICY "Users can insert invoicing config" ON invoicing_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update invoicing config" ON invoicing_config FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Users can delete invoicing config" ON invoicing_config FOR DELETE USING (true);
