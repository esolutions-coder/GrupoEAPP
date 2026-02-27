/*
  # Modificación del sistema de entregas de EPIs para soportar múltiples items
  
  1. Cambios
    - Crear tabla `epi_delivery_items` para almacenar los items de cada entrega
    - Modificar tabla `epi_deliveries` para que sea la cabecera de la entrega
    - Actualizar relaciones y políticas RLS
  
  2. Estructura
    - Una entrega puede tener múltiples items (EPIs)
    - Cada item tiene su cantidad, talla y observaciones individuales
    - El acta se genera por entrega completa, no por item
  
  3. Seguridad
    - Mantener RLS en todas las tablas
    - Políticas para autenticados
*/

-- Crear tabla para items de entrega
CREATE TABLE IF NOT EXISTS epi_delivery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES epi_deliveries(id) ON DELETE CASCADE,
  epi_item_id uuid NOT NULL REFERENCES epi_items(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  size text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Modificar la tabla epi_deliveries para quitar campos que ahora están en items
-- Primero verificamos si las columnas existen antes de intentar eliminarlas
DO $$
BEGIN
  -- Añadir columna de número de acta si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'epi_deliveries' AND column_name = 'acta_number'
  ) THEN
    ALTER TABLE epi_deliveries ADD COLUMN acta_number text;
  END IF;
  
  -- Crear índice único para número de acta
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'epi_deliveries' AND indexname = 'idx_epi_deliveries_acta_number'
  ) THEN
    CREATE UNIQUE INDEX idx_epi_deliveries_acta_number ON epi_deliveries(acta_number) 
    WHERE acta_number IS NOT NULL;
  END IF;
END $$;

-- Indices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_epi_delivery_items_delivery 
ON epi_delivery_items(delivery_id);

CREATE INDEX IF NOT EXISTS idx_epi_delivery_items_epi 
ON epi_delivery_items(epi_item_id);

-- Habilitar RLS
ALTER TABLE epi_delivery_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para epi_delivery_items
DROP POLICY IF EXISTS "Users can view delivery items" ON epi_delivery_items;
CREATE POLICY "Users can view delivery items"
  ON epi_delivery_items FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert delivery items" ON epi_delivery_items;
CREATE POLICY "Users can insert delivery items"
  ON epi_delivery_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update delivery items" ON epi_delivery_items;
CREATE POLICY "Users can update delivery items"
  ON epi_delivery_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete delivery items" ON epi_delivery_items;
CREATE POLICY "Users can delete delivery items"
  ON epi_delivery_items FOR DELETE
  TO authenticated
  USING (true);

-- Función para actualizar stock cuando se crean items de entrega
CREATE OR REPLACE FUNCTION update_epi_stock_on_delivery_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Reducir stock del item EPI
  UPDATE epi_items
  SET 
    current_stock = current_stock - NEW.quantity,
    updated_at = now()
  WHERE id = NEW.epi_item_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar stock
DROP TRIGGER IF EXISTS trigger_update_epi_stock_on_delivery_item ON epi_delivery_items;
CREATE TRIGGER trigger_update_epi_stock_on_delivery_item
  AFTER INSERT ON epi_delivery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_epi_stock_on_delivery_item();

-- Función para restaurar stock cuando se eliminan items de entrega
CREATE OR REPLACE FUNCTION restore_epi_stock_on_delivery_item_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Restaurar stock del item EPI
  UPDATE epi_items
  SET 
    current_stock = current_stock + OLD.quantity,
    updated_at = now()
  WHERE id = OLD.epi_item_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger para restaurar stock
DROP TRIGGER IF EXISTS trigger_restore_epi_stock_on_delivery_item_delete ON epi_delivery_items;
CREATE TRIGGER trigger_restore_epi_stock_on_delivery_item_delete
  AFTER DELETE ON epi_delivery_items
  FOR EACH ROW
  EXECUTE FUNCTION restore_epi_stock_on_delivery_item_delete();
