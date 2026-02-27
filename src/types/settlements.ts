export type SettlementStatus = 'draft' | 'calculated' | 'approved' | 'paid';
export type HourType = 'normal' | 'overtime' | 'night' | 'holiday';
export type IncidentType = 'absence' | 'permission' | 'sick_leave' | 'vacation';
export type DeductionType = 'irpf' | 'garnishment' | 'sanction' | 'advance' | 'social_security' | 'other';
export type IncomeType = 'per_diem' | 'bonus' | 'award' | 'transportation' | 'other';

export interface PayrollSettlement {
  id: string;
  settlement_code: string;
  worker_id: string;
  project_id?: string;
  period_month: number;
  period_year: number;
  status: SettlementStatus;
  base_salary: number;
  total_hours_worked: number;
  gross_amount: number;
  total_deductions: number;
  total_additional_income: number;
  net_amount: number;
  payment_date?: string;
  notes?: string;
  auto_calculated?: boolean;
  work_reports_period_start?: string;
  work_reports_period_end?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface SettlementHour {
  id: string;
  settlement_id: string;
  hour_type: HourType;
  hours: number;
  rate: number;
  amount: number;
  description?: string;
  created_at: string;
}

export interface SettlementIncident {
  id: string;
  settlement_id: string;
  incident_type: IncidentType;
  incident_date: string;
  days: number;
  hours: number;
  affects_payment: boolean;
  discount_amount: number;
  description?: string;
  justification_document?: string;
  approved_by?: string;
  approval_date?: string;
  created_at: string;
}

export interface SettlementDeduction {
  id: string;
  settlement_id: string;
  deduction_type: DeductionType;
  amount: number;
  percentage: number;
  description?: string;
  reference?: string;
  created_at: string;
}

export interface SettlementAdditionalIncome {
  id: string;
  settlement_id: string;
  income_type: IncomeType;
  amount: number;
  description?: string;
  created_at: string;
}

export interface SettlementWithDetails extends PayrollSettlement {
  worker_name?: string;
  project_name?: string;
  hours: SettlementHour[];
  incidents: SettlementIncident[];
  deductions: SettlementDeduction[];
  additional_income: SettlementAdditionalIncome[];
}

export interface SettlementFormData {
  settlement_code: string;
  worker_id: string;
  project_id?: string;
  period_month: number;
  period_year: number;
  base_salary: number;
  notes?: string;
  hours: {
    hour_type: HourType;
    hours: number;
    rate: number;
    description?: string;
  }[];
  incidents: {
    incident_type: IncidentType;
    incident_date: string;
    days: number;
    hours: number;
    affects_payment: boolean;
    discount_amount: number;
    description?: string;
  }[];
  deductions: {
    deduction_type: DeductionType;
    amount: number;
    percentage: number;
    description?: string;
    reference?: string;
  }[];
  additional_income: {
    income_type: IncomeType;
    amount: number;
    description?: string;
  }[];
}

export interface SettlementSummary {
  total_settlements: number;
  total_gross_amount: number;
  total_deductions: number;
  total_net_amount: number;
  settlements_by_status: {
    draft: number;
    calculated: number;
    approved: number;
    paid: number;
  };
}

export interface SettlementCalculation {
  base_salary: number;
  hours_total: number;
  incidents_discount: number;
  deductions_total: number;
  additional_income_total: number;
  gross_amount: number;
  net_amount: number;
}

export interface SettlementWorkReportLink {
  id: string;
  settlement_id: string;
  work_report_id: string;
  hours_counted: number;
  created_at: string;
}

export interface ProjectSettlementSummary {
  project_id?: string;
  project_name: string;
  period_month: number;
  period_year: number;
  total_settlements: number;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  total_hours: number;
}
