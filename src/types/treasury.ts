export interface Bank {
  id: string;
  name: string;
  bic_swift?: string;
  account_manager?: string;
  phone?: string;
  email?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  bank_id: string;
  account_alias: string;
  iban: string;
  account_type: 'operative' | 'collections' | 'payments' | 'guarantees' | 'payroll';
  initial_balance: number;
  initial_balance_date: string;
  current_balance: number;
  status: 'active' | 'blocked' | 'closed';
  notes?: string;
  created_at: string;
  updated_at: string;
  bank?: Bank;
}

export interface CreditLine {
  id: string;
  bank_id: string;
  policy_number: string;
  granted_limit: number;
  drawn_amount: number;
  available_amount: number;
  interest_rate?: number;
  commission_rate?: number;
  expiry_date?: string;
  project_id?: string;
  status: 'active' | 'expired' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  bank?: Bank;
  project?: any;
}

export interface LeasingContract {
  id: string;
  financial_entity: string;
  contract_number: string;
  asset_description: string;
  asset_type: 'machinery' | 'vehicle' | 'equipment' | 'other';
  monthly_fee: number;
  outstanding_capital?: number;
  contract_start_date: string;
  contract_end_date: string;
  project_id?: string;
  machinery_id?: string;
  vehicle_id?: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  project?: any;
}

export interface FactoringOperation {
  id: string;
  bank_id: string;
  invoice_number: string;
  client_id?: string;
  project_id?: string;
  operation_type: 'with_recourse' | 'without_recourse' | 'confirming';
  assignment_date: string;
  invoice_amount: number;
  advance_percentage: number;
  advanced_amount: number;
  retained_amount: number;
  commission_amount?: number;
  interest_amount?: number;
  due_date: string;
  settlement_date?: string;
  status: 'active' | 'settled' | 'defaulted';
  notes?: string;
  created_at: string;
  updated_at: string;
  bank?: Bank;
  client?: any;
  project?: any;
}

export interface TreasuryMovement {
  id: string;
  bank_account_id: string;
  operation_date: string;
  value_date: string;
  movement_type: 'income' | 'payment' | 'credit_line_draw' | 'credit_line_repayment' |
                 'factoring_advance' | 'factoring_settlement' | 'leasing_fee' |
                 'bank_fee' | 'interest' | 'transfer' | 'other';
  amount: number;
  concept: string;
  project_id?: string;
  client_id?: string;
  supplier_id?: string;
  credit_line_id?: string;
  leasing_contract_id?: string;
  factoring_operation_id?: string;
  document_reference?: string;
  reconciliation_status: 'pending' | 'reconciled' | 'disputed';
  reconciled_at?: string;
  reconciled_by?: string;
  imported_from_file?: string;
  imported_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  bank_account?: BankAccount;
  project?: any;
  client?: any;
  supplier?: any;
}

export interface BankReconciliation {
  id: string;
  bank_account_id: string;
  reconciliation_date: string;
  period_start_date: string;
  period_end_date: string;
  initial_balance: number;
  final_balance: number;
  total_incomes: number;
  total_expenses: number;
  reconciled_movements_count: number;
  pending_movements_count: number;
  status: 'in_progress' | 'completed' | 'reviewed';
  reconciled_by: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  bank_account?: BankAccount;
}

export interface TreasuryForecast {
  id: string;
  forecast_date: string;
  horizon_days: number;
  bank_account_id?: string;
  project_id?: string;
  forecast_type: 'expected_income' | 'expected_payment' | 'certification' | 'payroll' |
                 'credit_line_fee' | 'leasing_fee' | 'factoring_settlement' | 'other';
  concept: string;
  expected_amount: number;
  probability_percentage: number;
  client_id?: string;
  supplier_id?: string;
  invoice_reference?: string;
  is_confirmed: boolean;
  actual_movement_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  bank_account?: BankAccount;
  project?: any;
  client?: any;
  supplier?: any;
}

export interface TreasuryDashboardKPI {
  total_balance: number;
  available_balance: number;
  total_credit_lines: number;
  used_credit_lines: number;
  available_credit: number;
  credit_usage_percentage: number;
  monthly_financial_cost: number;
  active_factoring_operations: number;
  factoring_advanced: number;
  pending_reconciliations: number;
  projects_with_cash_tension: number;
  forecast_30_days: number;
  forecast_60_days: number;
  forecast_90_days: number;
}

export interface BankAccountWithDetails extends BankAccount {
  bank_name?: string;
  pending_movements?: number;
  monthly_income?: number;
  monthly_expenses?: number;
}

export interface CreditLineWithDetails extends CreditLine {
  bank_name?: string;
  usage_percentage?: number;
  days_to_expiry?: number;
}

export interface ProjectTreasury {
  project_id: string;
  project_name: string;
  total_incomes: number;
  total_payments: number;
  factoring_operations: number;
  factoring_amount: number;
  credit_used: number;
  cash_margin: number;
  financial_dependency: number;
}

export interface BankFormData {
  name: string;
  bic_swift: string;
  account_manager: string;
  phone: string;
  email: string;
  notes: string;
}

export interface BankAccountFormData {
  bank_id: string;
  account_alias: string;
  iban: string;
  account_type: string;
  initial_balance: number;
  initial_balance_date: string;
  status: string;
  notes: string;
}

export interface CreditLineFormData {
  bank_id: string;
  policy_number: string;
  granted_limit: number;
  interest_rate: number;
  commission_rate: number;
  expiry_date: string;
  project_id: string;
  notes: string;
}

export interface LeasingContractFormData {
  financial_entity: string;
  contract_number: string;
  asset_description: string;
  asset_type: string;
  monthly_fee: number;
  outstanding_capital: number;
  contract_start_date: string;
  contract_end_date: string;
  project_id: string;
  machinery_id: string;
  vehicle_id: string;
  notes: string;
}

export interface FactoringOperationFormData {
  bank_id: string;
  invoice_number: string;
  client_id: string;
  project_id: string;
  operation_type: string;
  assignment_date: string;
  invoice_amount: number;
  advance_percentage: number;
  commission_amount: number;
  interest_amount: number;
  due_date: string;
  notes: string;
}

export interface TreasuryMovementFormData {
  bank_account_id: string;
  operation_date: string;
  value_date: string;
  movement_type: string;
  amount: number;
  concept: string;
  project_id: string;
  client_id: string;
  supplier_id: string;
  credit_line_id: string;
  leasing_contract_id: string;
  factoring_operation_id: string;
  document_reference: string;
  notes: string;
}

export interface TreasuryForecastFormData {
  forecast_date: string;
  horizon_days: number;
  bank_account_id: string;
  project_id: string;
  forecast_type: string;
  concept: string;
  expected_amount: number;
  probability_percentage: number;
  client_id: string;
  supplier_id: string;
  invoice_reference: string;
  notes: string;
}

export interface ImportedBankStatement {
  file_name: string;
  bank_account_id: string;
  movements: ImportedMovement[];
  total_movements: number;
  total_incomes: number;
  total_expenses: number;
  duplicates_detected: number;
}

export interface ImportedMovement {
  operation_date: string;
  value_date: string;
  concept: string;
  amount: number;
  balance?: number;
  is_duplicate?: boolean;
  suggested_match?: TreasuryMovement;
}

export interface ReconciliationMatch {
  movement_id: string;
  imported_movement: ImportedMovement;
  match_score: number;
  match_type: 'exact' | 'amount' | 'date' | 'concept' | 'manual';
}
