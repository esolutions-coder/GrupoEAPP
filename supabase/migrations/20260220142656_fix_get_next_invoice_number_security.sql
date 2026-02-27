/*
  # Corregir función get_next_invoice_number con SECURITY DEFINER

  1. Cambios
    - Recrear la función con SECURITY DEFINER para que se ejecute con privilegios del propietario
    - Esto permite que la función pueda insertar en invoicing_config incluso si el usuario no tiene permisos directos
    
  2. Seguridad
    - La función controla internamente qué operaciones son permitidas
    - Solo se usa para gestionar numeración de facturas
*/

-- Eliminar función existente
DROP FUNCTION IF EXISTS get_next_invoice_number(text, integer);

-- Recrear con SECURITY DEFINER
CREATE OR REPLACE FUNCTION get_next_invoice_number(
  p_invoice_type text DEFAULT 'normal',
  p_year integer DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER -- Esta línea es clave: ejecuta con privilegios del propietario
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

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION get_next_invoice_number(text, integer) TO authenticated;
