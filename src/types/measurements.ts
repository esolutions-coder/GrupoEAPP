export type MeasurementStatus = 'active' | 'completed' | 'cancelled';
export type DocumentType = 'plan' | 'photo' | 'report' | 'specification' | 'other';
export type ChangeType = 'created' | 'updated' | 'deleted' | 'certified';

export interface MeasurementChapter {
  id: string;
  project_id: string;
  chapter_code: string;
  chapter_name: string;
  description?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MeasurementItem {
  id: string;
  project_id: string;
  chapter_id: string;
  item_code: string;
  description: string;
  unit_of_measure: string;
  budgeted_quantity: number;
  budgeted_unit_price: number;
  budgeted_total: number;
  technical_specs?: string;
  reference_documents?: string;
  notes?: string;
  status: MeasurementStatus;
  created_at: string;
  updated_at: string;
}

export interface MeasurementRecord {
  id: string;
  item_id: string;
  record_date: string;
  measured_quantity: number;
  is_preliminary: boolean;
  is_certified: boolean;
  certification_date?: string;
  certification_number?: string;
  observations?: string;
  measured_by?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MeasurementDocument {
  id: string;
  item_id: string;
  record_id?: string;
  document_type: DocumentType;
  document_name: string;
  document_url: string;
  file_size: number;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface MeasurementHistory {
  id: string;
  item_id?: string;
  record_id?: string;
  change_type: ChangeType;
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  changed_by?: string;
  changed_at: string;
}

export interface MeasurementItemWithDetails extends MeasurementItem {
  chapter_name?: string;
  project_name?: string;
  records: MeasurementRecord[];
  documents: MeasurementDocument[];
  total_measured: number;
  certified_quantity: number;
  percentage_executed: number;
}

export interface ChapterWithItems extends MeasurementChapter {
  items: MeasurementItemWithDetails[];
  total_budgeted: number;
  total_measured: number;
  total_certified: number;
}

export interface BudgetComparison {
  item_id: string;
  project_id: string;
  project_name: string;
  chapter_name: string;
  item_code: string;
  description: string;
  unit_of_measure: string;
  budgeted_quantity: number;
  budgeted_unit_price: number;
  budgeted_total: number;
  total_measured_quantity: number;
  total_measured_amount: number;
  certified_quantity: number;
  certified_amount: number;
  percentage_executed: number;
  pending_amount: number;
  status: MeasurementStatus;
}

export interface ChapterSummary {
  chapter_id: string;
  project_id: string;
  project_name: string;
  chapter_code: string;
  chapter_name: string;
  total_items: number;
  total_budgeted: number;
  total_measured: number;
  certified_records: number;
  total_certified: number;
}

export interface MeasurementFormData {
  chapter_id: string;
  item_code: string;
  description: string;
  unit_of_measure: string;
  budgeted_quantity: number;
  budgeted_unit_price: number;
  technical_specs?: string;
  reference_documents?: string;
  notes?: string;
}

export interface MeasurementRecordFormData {
  item_id: string;
  record_date: string;
  measured_quantity: number;
  is_preliminary: boolean;
  observations?: string;
  measured_by?: string;
}

export interface ImportedMeasurementData {
  chapter_code?: string;
  chapter_name?: string;
  item_code: string;
  description: string;
  unit_of_measure: string;
  budgeted_quantity: number;
  budgeted_unit_price: number;
  technical_specs?: string;
  notes?: string;
}
