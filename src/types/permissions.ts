export interface Role {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'approve' | 'sign';
  description?: string;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by?: string;
  assigned_at: string;
  created_at: string;
}

export interface Document {
  id: string;
  module: string;
  entity_id?: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type?: string;
  description?: string;
  uploaded_by?: string;
  uploaded_at: string;
  created_at: string;
}

export interface DigitalSignature {
  id: string;
  module: string;
  entity_id: string;
  signature_data: string;
  signed_by: string;
  signed_by_role?: string;
  signed_at: string;
  ip_address?: string;
  created_at: string;
}

export type ModuleType =
  | 'projects'
  | 'workers'
  | 'clients'
  | 'suppliers'
  | 'certifications'
  | 'measurements'
  | 'vacations'
  | 'work_reports'
  | 'settlements'
  | 'budgets'
  | 'treasury'
  | 'epi'
  | 'machinery'
  | 'crews';

export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'approve' | 'sign';
