/*
  # Corrección: Tipo de client_id en Budgets
  
  ## Problema
  La tabla `budgets` tiene `client_id` como `text`, pero `projects` lo tiene como `uuid`.
  Esto causa error al aprobar presupuestos porque el trigger intenta insertar text en uuid.
  
  ## Solución
  1. Convertir `budgets.client_id` de `text` a `uuid`
  2. Agregar foreign key a la tabla `clients`
  3. Limpiar valores no UUID existentes
  
  ## Impacto
  - Los presupuestos podrán crear proyectos sin error de tipo
  - Se establece integridad referencial con tabla clients
*/

-- Verificar y convertir client_id en budgets
DO $$
BEGIN
  -- Solo ejecutar si client_id es de tipo text
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budgets' 
    AND column_name = 'client_id' 
    AND data_type = 'text'
  ) THEN
    
    -- Permitir valores NULL temporalmente
    ALTER TABLE budgets ALTER COLUMN client_id DROP NOT NULL;
    
    -- Limpiar valores que no son UUID válidos
    UPDATE budgets
    SET client_id = NULL
    WHERE client_id IS NOT NULL 
    AND client_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    -- Convertir columna a uuid
    ALTER TABLE budgets ALTER COLUMN client_id TYPE uuid USING client_id::uuid;
    
    -- Agregar foreign key si la tabla clients existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
      -- Eliminar foreign key existente si existe
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'budgets_client_id_fkey' 
        AND table_name = 'budgets'
      ) THEN
        ALTER TABLE budgets DROP CONSTRAINT budgets_client_id_fkey;
      END IF;
      
      -- Agregar nueva foreign key
      ALTER TABLE budgets ADD CONSTRAINT budgets_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
    END IF;
    
    RAISE NOTICE 'client_id en budgets convertido de text a uuid correctamente';
  ELSE
    RAISE NOTICE 'client_id en budgets ya es de tipo uuid, no se requieren cambios';
  END IF;
END $$;

-- Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_budgets_client_id ON budgets(client_id);
