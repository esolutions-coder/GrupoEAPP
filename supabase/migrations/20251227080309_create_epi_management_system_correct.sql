/*
  # Sistema de Gestión de EPIs (Equipos de Protección Individual)
  
  Sistema completo para gestionar inventario, pedidos, entregas y alertas de EPIs con integración completa con módulos de Proveedores y Trabajadores.
*/

-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'epi_restock_frequency') THEN
    CREATE TYPE epi_restock_frequency AS ENUM ('daily', 'weekly', 'monthly', 'annual');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'epi_item_status') THEN
    CREATE TYPE epi_item_status AS ENUM ('active', 'inactive', 'discontinued');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'epi_condition') THEN
    CREATE TYPE epi_condition AS ENUM ('new', 'in_use', 'damaged', 'lost');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'epi_order_status') THEN
    CREATE TYPE epi_order_status AS ENUM ('pending', 'sent', 'received', 'cancelled');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'epi_alert_type') THEN
    CREATE TYPE epi_alert_type AS ENUM ('low_stock', 'restock_due', 'order_pending', 'delivery_required');
  END IF;
END $$;

-- Categorías de EPIs
CREATE TABLE IF NOT EXISTS epi_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Inventario de EPIs
CREATE TABLE IF NOT EXISTS epi_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES epi_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  sizes_available text[] DEFAULT '{}',
  current_stock integer DEFAULT 0 CHECK (current_stock >= 0),
  minimum_stock integer DEFAULT 10 CHECK (minimum_stock >= 0),
  restock_frequency epi_restock_frequency DEFAULT 'monthly',
  unit_price decimal(10,2) DEFAULT 0.00,
  location text,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  status epi_item_status DEFAULT 'active',
  last_delivery_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Entregas a trabajadores
CREATE TABLE IF NOT EXISTS epi_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  epi_item_id uuid NOT NULL REFERENCES epi_items(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  size text,
  delivery_date date DEFAULT CURRENT_DATE,
  condition epi_condition DEFAULT 'new',
  delivered_by text,
  notes text,
  signature_url text,
  created_at timestamptz DEFAULT now()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS epi_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  order_date date DEFAULT CURRENT_DATE,
  expected_delivery_date date,
  actual_delivery_date date,
  status epi_order_status DEFAULT 'pending',
  total_amount decimal(10,2) DEFAULT 0.00,
  notes text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Partidas de pedidos
CREATE TABLE IF NOT EXISTS epi_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES epi_orders(id) ON DELETE CASCADE,
  epi_item_id uuid NOT NULL REFERENCES epi_items(id) ON DELETE CASCADE,
  quantity_ordered integer NOT NULL CHECK (quantity_ordered > 0),
  quantity_received integer DEFAULT 0 CHECK (quantity_received >= 0),
  unit_price decimal(10,2) DEFAULT 0.00,
  subtotal decimal(10,2) GENERATED ALWAYS AS (quantity_ordered * unit_price) STORED
);

-- Alertas
CREATE TABLE IF NOT EXISTS epi_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  epi_item_id uuid REFERENCES epi_items(id) ON DELETE CASCADE,
  alert_type epi_alert_type NOT NULL,
  alert_message text NOT NULL,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_epi_items_category ON epi_items(category_id);
CREATE INDEX IF NOT EXISTS idx_epi_items_supplier ON epi_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_epi_items_status ON epi_items(status);
CREATE INDEX IF NOT EXISTS idx_epi_items_stock ON epi_items(current_stock);
CREATE INDEX IF NOT EXISTS idx_epi_deliveries_worker ON epi_deliveries(worker_id);
CREATE INDEX IF NOT EXISTS idx_epi_deliveries_item ON epi_deliveries(epi_item_id);
CREATE INDEX IF NOT EXISTS idx_epi_deliveries_date ON epi_deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_epi_orders_supplier ON epi_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_epi_orders_status ON epi_orders(status);
CREATE INDEX IF NOT EXISTS idx_epi_alerts_resolved ON epi_alerts(is_resolved);

-- Función: Actualizar stock después de entrega
CREATE OR REPLACE FUNCTION update_stock_after_delivery()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE epi_items
  SET 
    current_stock = current_stock - NEW.quantity,
    last_delivery_date = NEW.delivery_date,
    updated_at = now()
  WHERE id = NEW.epi_item_id;
  
  INSERT INTO epi_alerts (epi_item_id, alert_type, alert_message)
  SELECT 
    NEW.epi_item_id,
    'low_stock',
    'Stock bajo para ' || name || '. Stock actual: ' || current_stock || ', Mínimo: ' || minimum_stock
  FROM epi_items
  WHERE id = NEW.epi_item_id 
    AND current_stock <= minimum_stock
    AND NOT EXISTS (
      SELECT 1 FROM epi_alerts 
      WHERE epi_item_id = NEW.epi_item_id 
        AND alert_type = 'low_stock' 
        AND is_resolved = false
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_stock ON epi_deliveries;
CREATE TRIGGER trigger_update_stock
  AFTER INSERT ON epi_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_after_delivery();

-- Función: Actualizar stock al recibir pedido
CREATE OR REPLACE FUNCTION update_stock_on_order_received()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'received' AND OLD.status != 'received' THEN
    UPDATE epi_items ei
    SET 
      current_stock = current_stock + eoi.quantity_received,
      updated_at = now()
    FROM epi_order_items eoi
    WHERE eoi.order_id = NEW.id 
      AND eoi.epi_item_id = ei.id;
    
    UPDATE epi_alerts
    SET is_resolved = true, resolved_at = now()
    WHERE epi_item_id IN (
      SELECT epi_item_id FROM epi_order_items WHERE order_id = NEW.id
    ) AND alert_type = 'low_stock' AND is_resolved = false;
    
    NEW.actual_delivery_date = CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_order_received ON epi_orders;
CREATE TRIGGER trigger_order_received
  BEFORE UPDATE ON epi_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_on_order_received();

-- Función: Calcular total del pedido
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE epi_orders
  SET 
    total_amount = (
      SELECT COALESCE(SUM(subtotal), 0)
      FROM epi_order_items
      WHERE order_id = NEW.order_id
    ),
    updated_at = now()
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_total ON epi_order_items;
CREATE TRIGGER trigger_calculate_total
  AFTER INSERT OR UPDATE ON epi_order_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_order_total();

-- Vista: Resumen de stock
CREATE OR REPLACE VIEW epi_stock_summary AS
SELECT 
  ei.id,
  ei.name,
  ec.name as category_name,
  ei.current_stock,
  ei.minimum_stock,
  ei.current_stock - ei.minimum_stock as stock_difference,
  CASE 
    WHEN ei.current_stock <= ei.minimum_stock THEN 'critical'
    WHEN ei.current_stock <= ei.minimum_stock * 1.5 THEN 'low'
    ELSE 'ok'
  END as stock_status,
  ei.location,
  s.commercial_name as supplier_name,
  ei.unit_price,
  ei.last_delivery_date,
  COUNT(DISTINCT ed.id) as total_deliveries,
  COALESCE(SUM(ed.quantity), 0) as total_delivered
FROM epi_items ei
LEFT JOIN epi_categories ec ON ei.category_id = ec.id
LEFT JOIN suppliers s ON ei.supplier_id = s.id
LEFT JOIN epi_deliveries ed ON ei.id = ed.epi_item_id
WHERE ei.status = 'active'
GROUP BY ei.id, ec.name, s.commercial_name;

-- Vista: Entregas por trabajador
CREATE OR REPLACE VIEW epi_deliveries_by_worker AS
SELECT 
  w.id as worker_id,
  CONCAT(w.first_name, ' ', w.last_name) as worker_name,
  w.worker_code,
  ei.name as epi_name,
  ec.name as category_name,
  ed.quantity,
  ed.size,
  ed.delivery_date,
  ed.condition,
  ed.delivered_by,
  ed.notes
FROM epi_deliveries ed
JOIN workers w ON ed.worker_id = w.id
JOIN epi_items ei ON ed.epi_item_id = ei.id
LEFT JOIN epi_categories ec ON ei.category_id = ec.id
ORDER BY ed.delivery_date DESC;

-- Vista: Pedidos pendientes
CREATE OR REPLACE VIEW epi_pending_orders AS
SELECT 
  eo.id,
  eo.order_number,
  s.commercial_name as supplier_name,
  s.phone as supplier_phone,
  eo.order_date,
  eo.expected_delivery_date,
  eo.status,
  eo.total_amount,
  COUNT(eoi.id) as total_items,
  SUM(eoi.quantity_ordered) as total_quantity
FROM epi_orders eo
LEFT JOIN suppliers s ON eo.supplier_id = s.id
LEFT JOIN epi_order_items eoi ON eo.id = eoi.order_id
WHERE eo.status IN ('pending', 'sent')
GROUP BY eo.id, s.commercial_name, s.phone;

-- Categorías por defecto
INSERT INTO epi_categories (name, description, icon) VALUES
  ('Protección de cabeza', 'Cascos, gorros, protectores auditivos', 'hard-hat'),
  ('Protección de manos', 'Guantes de trabajo, protección térmica', 'hand'),
  ('Protección de pies', 'Botas de seguridad, calzado antideslizante', 'boot'),
  ('Protección visual', 'Gafas de seguridad, pantallas faciales', 'eye'),
  ('Protección respiratoria', 'Mascarillas, respiradores', 'wind'),
  ('Ropa de trabajo', 'Chalecos, monos, impermeables', 'shirt'),
  ('Protección anticaídas', 'Arneses, líneas de vida', 'anchor')
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE epi_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE epi_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE epi_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE epi_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE epi_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE epi_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Allow public access to epi_categories" ON epi_categories FOR ALL USING (true);
CREATE POLICY "Allow public access to epi_items" ON epi_items FOR ALL USING (true);
CREATE POLICY "Allow public access to epi_deliveries" ON epi_deliveries FOR ALL USING (true);
CREATE POLICY "Allow public access to epi_orders" ON epi_orders FOR ALL USING (true);
CREATE POLICY "Allow public access to epi_order_items" ON epi_order_items FOR ALL USING (true);
CREATE POLICY "Allow public access to epi_alerts" ON epi_alerts FOR ALL USING (true);