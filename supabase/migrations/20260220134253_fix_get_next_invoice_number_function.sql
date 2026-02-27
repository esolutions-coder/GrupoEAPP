/*
  # Corregir función get_next_invoice_number

  1. Cambios
    - Agregar WHERE clause a todos los UPDATE statements
    - La función actualiza solo el primer registro de invoicing_config
    - Se asegura de que siempre haya WHERE id = v_config.id

  2. Seguridad
    - Evita error "UPDATE requires a WHERE clause"
    - Mantiene la lógica de generación de números de factura
*/

CREATE OR REPLACE FUNCTION get_next_invoice_number(
  p_invoice_type text DEFAULT 'normal',
  p_year integer DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_config invoicing_config;
  v_next_number integer;
  v_series text;
  v_year integer;
BEGIN
  -- Obtener configuración
  SELECT * INTO v_config FROM invoicing_config LIMIT 1;

  -- Si no existe configuración, crearla
  IF v_config IS NULL THEN
    INSERT INTO invoicing_config (
      normal_series, 
      rectificative_series, 
      current_normal_number, 
      current_rectificative_number,
      current_year
    ) VALUES (
      'F/', 
      'R/', 
      0, 
      0,
      EXTRACT(YEAR FROM now())
    )
    RETURNING * INTO v_config;
  END IF;

  -- Determinar año
  v_year := COALESCE(p_year, EXTRACT(YEAR FROM now()));

  -- Resetear numeración si cambió el año
  IF v_year > v_config.current_year THEN
    UPDATE invoicing_config 
    SET
      current_normal_number = 0,
      current_rectificative_number = 0,
      current_year = v_year
    WHERE id = v_config.id;
    
    v_config.current_normal_number := 0;
    v_config.current_rectificative_number := 0;
  END IF;

  -- Incrementar según tipo
  IF p_invoice_type = 'rectificative' THEN
    v_next_number := v_config.current_rectificative_number + 1;
    v_series := v_config.rectificative_series;
    
    UPDATE invoicing_config 
    SET current_rectificative_number = v_next_number
    WHERE id = v_config.id;
  ELSE
    v_next_number := v_config.current_normal_number + 1;
    v_series := v_config.normal_series;
    
    UPDATE invoicing_config 
    SET current_normal_number = v_next_number
    WHERE id = v_config.id;
  END IF;

  -- Retornar número completo
  RETURN v_series || LPAD(v_next_number::text, 6, '0') || '/' || v_year;
END;
$$;
