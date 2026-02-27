export type CertificationStatus = 'draft' | 'validated' | 'certified' | 'rejected';
export type SignatureStatus = 'pending' | 'signed' | 'rejected';
export type SignatureRole = 'site_manager' | 'technician' | 'client' | 'director';
export type CertificationAction = 'created' | 'updated' | 'validated' | 'certified' | 'rejected' | 'duplicated';

export interface Certification {
  id: string;
  project_id: string;
  certification_number: string;
  certification_code?: string;
  contractor: string;
  issue_date: string;
  period_start: string;
  period_end: string;
  status: CertificationStatus;
  total_amount: number;
  accumulated_amount: number;
  retention_percentage: number;
  retention_amount: number;
  discount_amount: number;
  net_amount: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CertificationItem {
  id: string;
  certification_id: string;
  measurement_item_id?: string;
  item_code: string;
  description: string;
  unit_of_measure: string;
  unit_price: number;
  budgeted_quantity: number;
  previous_quantity: number;
  current_quantity: number;
  accumulated_quantity: number;
  percentage_executed: number;
  previous_amount: number;
  current_amount: number;
  accumulated_amount: number;
  observations?: string;
  created_at: string;
}

export interface CertificationSignature {
  id: string;
  certification_id: string;
  role: SignatureRole;
  signer_name: string;
  signer_email?: string;
  signature_date?: string;
  status: SignatureStatus;
  rejection_reason?: string;
  signature_data?: string;
  created_at: string;
}

export interface CertificationDocument {
  id: string;
  certification_id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  file_size: number;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface CertificationHistory {
  id: string;
  certification_id: string;
  action: CertificationAction;
  changed_by?: string;
  changes?: string;
  changed_at: string;
}

export interface CertificationSummary extends Certification {
  project_name: string;
  total_items: number;
  signed_count: number;
  total_signatures_required: number;
  all_signed: boolean;
}

export interface CertificationEconomicControl {
  project_id: string;
  project_name: string;
  total_budget: number;
  total_certifications: number;
  total_certified: number;
  accumulated_certified: number;
  total_retention: number;
  total_discounts: number;
  total_net_amount: number;
  pending_to_certify: number;
  percentage_certified: number;
}

export interface CertificationWithDetails extends Certification {
  project_name: string;
  items: CertificationItem[];
  signatures: CertificationSignature[];
  documents: CertificationDocument[];
  history: CertificationHistory[];
}

export interface CertificationFormData {
  project_id: string;
  certification_number: string;
  certification_code?: string;
  contractor: string;
  issue_date: string;
  period_start: string;
  period_end: string;
  retention_percentage: number;
  discount_amount: number;
  notes?: string;
}

export interface CertificationItemFormData {
  item_code: string;
  description: string;
  unit_of_measure: string;
  unit_price: number;
  budgeted_quantity: number;
  previous_quantity: number;
  current_quantity: number;
  observations?: string;
}
