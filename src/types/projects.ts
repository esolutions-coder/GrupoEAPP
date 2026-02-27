export interface Project {
  id: string;
  name: string;
  code: string;
  client_id: string;
  project_manager: string;
  start_date: string;
  end_date: string | null;
  hourly_rate_labor: number;
  hourly_rate_machinery: number;
  status: string;
  description: string;
  address: string;
  city: string;
  budget_amount: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectBudget {
  id: string;
  project_id: string;
  version: number;
  total_amount: number;
  status: string;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  notes: string;
}

export interface ProjectBudgetItem {
  id: string;
  budget_id: string;
  chapter: string;
  item_code: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  order_index: number;
  created_at: string;
}

export interface ProjectMeasurement {
  id: string;
  project_id: string;
  budget_item_id: string | null;
  measurement_date: string;
  chapter: string;
  description: string;
  planned_quantity: number;
  executed_quantity: number;
  unit: string;
  reference_docs: string;
  notes: string;
  created_at: string;
}

export interface ProjectCertification {
  id: string;
  project_id: string;
  certification_number: number;
  certification_date: string;
  period_start: string;
  period_end: string;
  total_origin: number;
  total_previous: number;
  total_current: number;
  deviations: number;
  discounts: number;
  final_amount: number;
  status: string;
  authorized_by: string | null;
  approved_at: string | null;
  notes: string;
  created_at: string;
}

export interface ProjectCertificationItem {
  id: string;
  certification_id: string;
  budget_item_id: string | null;
  quantity_origin: number;
  quantity_previous: number;
  quantity_current: number;
  unit_price: number;
  amount_current: number;
  created_at: string;
}

export interface ProjectCost {
  id: string;
  project_id: string;
  cost_date: string;
  cost_type: string;
  category: string;
  description: string;
  amount: number;
  supplier_id: string | null;
  invoice_number: string;
  notes: string;
  created_at: string;
}

export interface ProjectQualitySafety {
  id: string;
  project_id: string;
  record_date: string;
  record_type: string;
  category: string;
  severity: string;
  description: string;
  actions_taken: string;
  responsible: string;
  status: string;
  resolution_date: string | null;
  created_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  document_type: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  upload_date: string;
  tags: string[];
}

export interface ProjectBudgetChange {
  id: string;
  budget_id: string;
  change_date: string;
  changed_by: string;
  change_type: string;
  changes_description: string;
  old_values: any;
  new_values: any;
}
