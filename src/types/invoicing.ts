export interface InvoicingConfig {
  id: string;
  normal_series: string;
  rectificative_series: string;
  current_normal_number: number;
  current_rectificative_number: number;
  current_year: number;
  default_iva_rate: number;
  default_retention_rate: number;
  default_guarantee_rate: number;
  default_payment_days: number;
  company_name: string;
  company_cif: string;
  company_address: string;
  company_city: string;
  company_postal_code: string;
  company_phone: string;
  company_email: string;
  bank_account: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyClosing {
  id: string;
  project_id: string;
  project_name: string;
  client_id: string;
  client_name: string;
  month: number;
  year: number;
  total_hours: number;
  total_amount: number;
  status: 'pending' | 'invoiced' | 'cancelled';
  work_reports_count: number;
  notes: string;
  invoiced_at?: string;
  invoice_id?: string;
  created_at: string;
  created_by: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_series: string;
  invoice_type: 'normal' | 'isp' | 'rectificative';
  rectificative_type?: 'credit' | 'substitution';
  original_invoice_id?: string;
  client_id: string;
  client_name: string;
  client_cif: string;
  client_address: string;
  client_city: string;
  client_postal_code: string;
  project_id?: string;
  project_name: string;
  project_code: string;
  monthly_closing_id?: string;
  issue_date: string;
  due_date: string;
  payment_days: number;
  payment_method_label?: string;
  subtotal: number;
  iva_rate: number;
  iva_amount: number;
  retention_rate: number;
  retention_amount: number;
  guarantee_rate: number;
  guarantee_amount: number;
  total: number;
  paid_amount: number;
  pending_amount: number;
  status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid';
  is_isp: boolean;
  has_guarantee: boolean;
  guarantee_released: boolean;
  notes: string;
  internal_notes: string;
  portal_token?: string;
  portal_token_expires_at?: string;
  pdf_url: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  discount_rate: number;
  discount_amount: number;
  subtotal: number;
  iva_rate: number;
  iva_amount: number;
  total: number;
  work_report_id?: string;
  created_at: string;
}

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method: 'transfer' | 'check' | 'cash' | 'card' | 'other';
  reference: string;
  notes: string;
  created_at: string;
  created_by: string;
}

export interface InvoiceGuarantee {
  id: string;
  invoice_id: string;
  amount: number;
  retention_date: string;
  release_date?: string;
  status: 'retained' | 'released' | 'claimed';
  notes: string;
  created_at: string;
  released_at?: string;
  released_by: string;
}

export interface ClientPortalToken {
  id: string;
  client_id: string;
  token: string;
  expires_at: string;
  last_accessed_at?: string;
  access_count: number;
  is_active: boolean;
  created_at: string;
}

export interface InvoiceWithLines extends Invoice {
  lines: InvoiceLine[];
  payments: InvoicePayment[];
  guarantees: InvoiceGuarantee[];
}

export interface InvoiceStats {
  current_month_total: number;
  current_year_total: number;
  pending_amount: number;
  pending_guarantees: number;
  overdue_count: number;
  overdue_amount: number;
}

export interface MonthlyInvoicingData {
  month: string;
  invoiced: number;
  collected: number;
}
