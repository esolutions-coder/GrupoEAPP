/*
  # Añadir campo de forma de pago a facturas

  1. Cambios
    - Añadir columna `payment_method_label` a la tabla `invoices`
    - Este campo almacena la descripción completa de la forma de pago seleccionada
    
  2. Notas
    - Campo opcional con valor por defecto
    - Permite registrar formas de pago personalizadas
*/

-- Añadir columna si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'payment_method_label'
  ) THEN
    ALTER TABLE invoices ADD COLUMN payment_method_label text DEFAULT 'TRANSFERENCIA BANCARIA 30 DIAS';
  END IF;
END $$;
