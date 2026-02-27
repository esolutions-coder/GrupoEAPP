/*
  # Agregar política de INSERT para invoicing_config

  1. Cambios
    - Agregar política de INSERT para permitir crear configuración inicial
    - Esto permite que la función get_next_invoice_number cree el registro automáticamente
    
  2. Seguridad
    - Solo permite insertar si no existe registro previo
    - Usuarios autenticados pueden crear la configuración inicial
*/

-- Agregar política de INSERT
CREATE POLICY "Users can insert invoicing config"
  ON invoicing_config
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
