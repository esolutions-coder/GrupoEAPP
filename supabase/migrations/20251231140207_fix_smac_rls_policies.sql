/*
  # Corrección de Políticas RLS para SMAC

  ## Cambios
  1. Modificar políticas RLS de smac_records para permitir acceso público
  2. Esto permite usar el sistema sin autenticación para pruebas

  ## Notas
  - Las políticas ahora permiten acceso a usuarios anónimos y autenticados
  - En producción, se deberían ajustar para requerir autenticación
*/

-- Eliminar políticas existentes de smac_records
DROP POLICY IF EXISTS "Users can view SMAC records" ON smac_records;
DROP POLICY IF EXISTS "Users can create SMAC records" ON smac_records;
DROP POLICY IF EXISTS "Users can update SMAC records" ON smac_records;
DROP POLICY IF EXISTS "Users can delete SMAC records" ON smac_records;

-- Crear nuevas políticas que permitan acceso público
CREATE POLICY "Allow public read SMAC records"
  ON smac_records FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert SMAC records"
  ON smac_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update SMAC records"
  ON smac_records FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete SMAC records"
  ON smac_records FOR DELETE
  USING (true);

-- Actualizar políticas de tablas relacionadas
DROP POLICY IF EXISTS "Users can view SMAC documents" ON smac_documents;
DROP POLICY IF EXISTS "Users can create SMAC documents" ON smac_documents;
DROP POLICY IF EXISTS "Users can update SMAC documents" ON smac_documents;
DROP POLICY IF EXISTS "Users can delete SMAC documents" ON smac_documents;

CREATE POLICY "Allow public read SMAC documents"
  ON smac_documents FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert SMAC documents"
  ON smac_documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update SMAC documents"
  ON smac_documents FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete SMAC documents"
  ON smac_documents FOR DELETE
  USING (true);

-- Actualizar políticas de smac_actions
DROP POLICY IF EXISTS "Users can view SMAC actions" ON smac_actions;
DROP POLICY IF EXISTS "Users can create SMAC actions" ON smac_actions;
DROP POLICY IF EXISTS "Users can update SMAC actions" ON smac_actions;
DROP POLICY IF EXISTS "Users can delete SMAC actions" ON smac_actions;

CREATE POLICY "Allow public read SMAC actions"
  ON smac_actions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert SMAC actions"
  ON smac_actions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update SMAC actions"
  ON smac_actions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete SMAC actions"
  ON smac_actions FOR DELETE
  USING (true);

-- Actualizar políticas de smac_alerts
DROP POLICY IF EXISTS "Users can view SMAC alerts" ON smac_alerts;
DROP POLICY IF EXISTS "Users can create SMAC alerts" ON smac_alerts;
DROP POLICY IF EXISTS "Users can update SMAC alerts" ON smac_alerts;
DROP POLICY IF EXISTS "Users can delete SMAC alerts" ON smac_alerts;

CREATE POLICY "Allow public read SMAC alerts"
  ON smac_alerts FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert SMAC alerts"
  ON smac_alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update SMAC alerts"
  ON smac_alerts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete SMAC alerts"
  ON smac_alerts FOR DELETE
  USING (true);

-- Actualizar políticas de smac_templates
DROP POLICY IF EXISTS "Users can view SMAC templates" ON smac_templates;
DROP POLICY IF EXISTS "Users can create SMAC templates" ON smac_templates;
DROP POLICY IF EXISTS "Users can update SMAC templates" ON smac_templates;
DROP POLICY IF EXISTS "Users can delete SMAC templates" ON smac_templates;

CREATE POLICY "Allow public read SMAC templates"
  ON smac_templates FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert SMAC templates"
  ON smac_templates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update SMAC templates"
  ON smac_templates FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete SMAC templates"
  ON smac_templates FOR DELETE
  USING (true);

-- Actualizar políticas de legal_precedents
DROP POLICY IF EXISTS "Users can view legal precedents" ON legal_precedents;
DROP POLICY IF EXISTS "Users can create legal precedents" ON legal_precedents;
DROP POLICY IF EXISTS "Users can update legal precedents" ON legal_precedents;
DROP POLICY IF EXISTS "Users can delete legal precedents" ON legal_precedents;

CREATE POLICY "Allow public read legal precedents"
  ON legal_precedents FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert legal precedents"
  ON legal_precedents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update legal precedents"
  ON legal_precedents FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete legal precedents"
  ON legal_precedents FOR DELETE
  USING (true);
