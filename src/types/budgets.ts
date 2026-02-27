export type BudgetStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'closed';

export interface Budget {
  id: string;
  project_id: string;
  client_id?: string;
  contractor: string;
  budget_code: string;
  version: number;
  issue_date: string;
  status: BudgetStatus;
  general_expenses_percentage: number;
  industrial_benefit_percentage: number;
  discount_percentage: number;
  tax_percentage: number;
  subtotal: number;
  total: number;
  notes?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  generated_project_id?: string;
  can_generate_project?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetChapter {
  id: string;
  budget_id: string;
  chapter_code: string;
  chapter_name: string;
  display_order: number;
  subtotal: number;
  created_at: string;
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  chapter_id: string;
  item_code: string;
  description: string;
  unit_of_measure: string;
  estimated_quantity: number;
  unit_price: number;
  amount: number;
  display_order: number;
  notes?: string;
  created_at: string;
}

export interface BudgetVersion {
  id: string;
  original_budget_id: string;
  version: number;
  created_by?: string;
  created_at: string;
  changes?: string;
}

export interface BudgetDocument {
  id: string;
  budget_id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  file_size: number;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface BudgetSummary extends Budget {
  project_name: string;
  total_chapters: number;
  total_items: number;
}

export interface BudgetWithDetails extends Budget {
  project_name: string;
  chapters: BudgetChapterWithItems[];
  documents: BudgetDocument[];
  versions: BudgetVersion[];
}

export interface BudgetChapterWithItems extends BudgetChapter {
  items: BudgetItem[];
}

export interface BudgetFormData {
  project_id: string;
  client_id?: string;
  contractor: string;
  budget_code: string;
  issue_date: string;
  general_expenses_percentage: number;
  industrial_benefit_percentage: number;
  discount_percentage: number;
  tax_percentage: number;
  notes?: string;
}

export interface BudgetChapterFormData {
  chapter_code: string;
  chapter_name: string;
  display_order: number;
}

export interface BudgetItemFormData {
  chapter_id: string;
  item_code: string;
  description: string;
  unit_of_measure: string;
  estimated_quantity: number;
  unit_price: number;
  display_order: number;
  notes?: string;
}

export interface BudgetCalculations {
  subtotal: number;
  general_expenses: number;
  industrial_benefit: number;
  discount: number;
  base_before_tax: number;
  tax_amount: number;
  total: number;
}
