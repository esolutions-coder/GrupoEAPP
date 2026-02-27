/*
  # Sistema de Roles, Permisos y Gestión Documental

  1. Nuevas Tablas
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Nombre del rol
      - `description` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `permissions`
      - `id` (uuid, primary key)
      - `module` (text) - Módulo: projects, workers, clients, etc.
      - `action` (text) - Acción: create, read, update, delete, export, import
      - `description` (text)
      - `created_at` (timestamp)

    - `role_permissions`
      - `id` (uuid, primary key)
      - `role_id` (uuid, referencia a roles)
      - `permission_id` (uuid, referencia a permissions)
      - `created_at` (timestamp)

    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `role_id` (uuid, referencia a roles)
      - `assigned_by` (uuid)
      - `assigned_at` (timestamp)
      - `created_at` (timestamp)

    - `documents`
      - `id` (uuid, primary key)
      - `module` (text) - Módulo al que pertenece
      - `entity_id` (uuid) - ID de la entidad relacionada
      - `document_type` (text) - Tipo: contract, certificate, invoice, etc.
      - `file_name` (text)
      - `file_url` (text)
      - `file_size` (bigint)
      - `mime_type` (text)
      - `description` (text)
      - `uploaded_by` (uuid)
      - `uploaded_at` (timestamp)
      - `created_at` (timestamp)

    - `digital_signatures`
      - `id` (uuid, primary key)
      - `module` (text)
      - `entity_id` (uuid)
      - `signature_data` (text) - Base64 de la firma
      - `signed_by` (text)
      - `signed_by_role` (text)
      - `signed_at` (timestamp)
      - `ip_address` (text)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados
*/

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de permisos
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(module, action),
  CHECK (action IN ('create', 'read', 'update', 'delete', 'export', 'import', 'approve', 'sign'))
);

-- Tabla de relación rol-permisos
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Tabla de roles de usuarios
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by uuid,
  assigned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Tabla de documentos
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  entity_id uuid,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint DEFAULT 0,
  mime_type text,
  description text,
  uploaded_by uuid,
  uploaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CHECK (module IN ('projects', 'workers', 'clients', 'suppliers', 'certifications', 'measurements', 'vacations', 'work_reports', 'settlements', 'budgets', 'treasury', 'epi', 'machinery', 'crews'))
);

-- Tabla de firmas digitales
CREATE TABLE IF NOT EXISTS digital_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  entity_id uuid NOT NULL,
  signature_data text NOT NULL,
  signed_by text NOT NULL,
  signed_by_role text,
  signed_at timestamptz DEFAULT now(),
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_documents_module ON documents(module);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_id);
CREATE INDEX IF NOT EXISTS idx_digital_signatures_module ON digital_signatures(module);
CREATE INDEX IF NOT EXISTS idx_digital_signatures_entity ON digital_signatures(entity_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at en roles
DROP TRIGGER IF EXISTS roles_updated_at ON roles;
CREATE TRIGGER roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_roles_updated_at();

-- Función para verificar permisos
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id uuid,
  p_module text,
  p_action text
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
      AND p.module = p_module
      AND p.action = p_action
      AND r.is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- Habilitar RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_signatures ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para roles
CREATE POLICY "Usuarios autenticados pueden ver roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear roles"
  ON roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar roles"
  ON roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar roles"
  ON roles FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para permissions
CREATE POLICY "Usuarios autenticados pueden ver permisos"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear permisos"
  ON permissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar permisos"
  ON permissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar permisos"
  ON permissions FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para role_permissions
CREATE POLICY "Usuarios autenticados pueden ver relaciones rol-permiso"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear relaciones rol-permiso"
  ON role_permissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar relaciones rol-permiso"
  ON role_permissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar relaciones rol-permiso"
  ON role_permissions FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para user_roles
CREATE POLICY "Usuarios autenticados pueden ver roles de usuarios"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden asignar roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar roles de usuarios"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar roles de usuarios"
  ON user_roles FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para documents
CREATE POLICY "Usuarios autenticados pueden ver documentos"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden subir documentos"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar documentos"
  ON documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar documentos"
  ON documents FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para digital_signatures
CREATE POLICY "Usuarios autenticados pueden ver firmas"
  ON digital_signatures FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear firmas"
  ON digital_signatures FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar firmas"
  ON digital_signatures FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar firmas"
  ON digital_signatures FOR DELETE
  TO authenticated
  USING (true);

-- Insertar roles predeterminados
INSERT INTO roles (name, description) VALUES
  ('Super Administrador', 'Acceso completo a todos los módulos del sistema'),
  ('Administrador', 'Gestión completa de proyectos, personal y operaciones'),
  ('Jefe de Obra', 'Gestión de obras asignadas, personal y partes de trabajo'),
  ('Encargado', 'Supervisión de cuadrillas y partes de trabajo'),
  ('Administrativo', 'Gestión documental, certificaciones y tesorería'),
  ('Trabajador', 'Acceso limitado a consultas y partes propios')
ON CONFLICT (name) DO NOTHING;

-- Insertar permisos para todos los módulos
DO $$
DECLARE
  module_name text;
  action_name text;
  modules text[] := ARRAY['projects', 'workers', 'clients', 'suppliers', 'certifications', 'measurements', 'vacations', 'work_reports', 'settlements', 'budgets', 'treasury', 'epi', 'machinery', 'crews'];
  actions text[] := ARRAY['create', 'read', 'update', 'delete', 'export', 'import', 'approve', 'sign'];
BEGIN
  FOREACH module_name IN ARRAY modules
  LOOP
    FOREACH action_name IN ARRAY actions
    LOOP
      INSERT INTO permissions (module, action, description)
      VALUES (
        module_name,
        action_name,
        'Permiso para ' || action_name || ' en módulo ' || module_name
      )
      ON CONFLICT (module, action) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Asignar todos los permisos al Super Administrador
DO $$
DECLARE
  super_admin_id uuid;
  perm_id uuid;
BEGIN
  SELECT id INTO super_admin_id FROM roles WHERE name = 'Super Administrador';
  
  FOR perm_id IN SELECT id FROM permissions
  LOOP
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES (super_admin_id, perm_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END LOOP;
END $$;

-- Asignar permisos al Administrador
DO $$
DECLARE
  admin_id uuid;
  perm_id uuid;
BEGIN
  SELECT id INTO admin_id FROM roles WHERE name = 'Administrador';
  
  FOR perm_id IN 
    SELECT id FROM permissions 
    WHERE action != 'delete' OR module NOT IN ('workers', 'clients', 'projects')
  LOOP
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES (admin_id, perm_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END LOOP;
END $$;