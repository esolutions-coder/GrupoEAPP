export interface Machinery {
  id: string;
  machinery_code: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  license_plate?: string;
  purchase_date?: string;
  purchase_price?: number;
  current_value?: number;
  hourly_cost: number;
  status: 'active' | 'maintenance' | 'inactive' | 'sold';
  location?: string;
  requires_operator_license: boolean;
  fuel_type?: string;
  fuel_capacity?: number;
  max_hours_before_maintenance: number;
  current_hours: number;
  ownership_type?: 'owned' | 'rented';
  supplier_id?: string;
  monthly_rental_cost?: number;
  rental_start_date?: string;
  rental_end_date?: string;
  operator_monthly_cost?: number;
  insurance_monthly_cost?: number;
  maintenance_monthly_budget?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MachineryEpiRequirement {
  id: string;
  machinery_id: string;
  epi_item_id: string;
  is_mandatory: boolean;
  created_at: string;
  updated_at: string;
}

export interface MachineryOperatorAuthorization {
  id: string;
  worker_id: string;
  machinery_id: string;
  authorization_date: string;
  expiry_date?: string;
  authorized_by: string;
  certification_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MachineryDailyReport {
  id: string;
  report_date: string;
  machinery_id: string;
  worker_id: string;
  project_id: string;
  work_report_id?: string;
  start_hour_meter?: number;
  end_hour_meter?: number;
  productive_hours: number;
  idle_hours: number;
  activity_description?: string;
  production_quantity?: number;
  production_unit?: string;
  fuel_consumed?: number;
  fuel_cost?: number;
  incident_occurred: boolean;
  incident_description?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_by?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MachineryMaintenance {
  id: string;
  machinery_id: string;
  maintenance_date: string;
  maintenance_type: 'preventive' | 'corrective' | 'inspection';
  description: string;
  hours_at_maintenance?: number;
  cost?: number;
  performed_by?: string;
  next_maintenance_date?: string;
  next_maintenance_hours?: number;
  downtime_hours?: number;
  parts_replaced?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FleetVehicle {
  id: string;
  vehicle_code: string;
  license_plate: string;
  vehicle_type: 'car' | 'van' | 'truck' | 'pickup';
  brand?: string;
  model?: string;
  year?: number;
  fuel_type?: string;
  fuel_capacity?: number;
  purchase_date?: string;
  purchase_price?: number;
  current_odometer: number;
  status: 'active' | 'maintenance' | 'inactive' | 'sold';
  assigned_to_worker_id?: string;
  monthly_km_limit: number;
  insurance_company?: string;
  insurance_policy?: string;
  insurance_expiry?: string;
  itv_expiry?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleDailyUsage {
  id: string;
  usage_date: string;
  vehicle_id: string;
  worker_id: string;
  project_id?: string;
  start_odometer: number;
  end_odometer: number;
  km_traveled: number;
  purpose?: string;
  route?: string;
  fuel_refilled?: number;
  fuel_cost?: number;
  toll_cost?: number;
  parking_cost?: number;
  incident_occurred: boolean;
  incident_description?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleMaintenance {
  id: string;
  vehicle_id: string;
  maintenance_date: string;
  maintenance_type: 'oil_change' | 'inspection' | 'repair' | 'itv';
  description: string;
  odometer_at_maintenance?: number;
  cost?: number;
  workshop?: string;
  invoice_number?: string;
  next_maintenance_date?: string;
  next_maintenance_km?: number;
  parts_replaced?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleAlert {
  id: string;
  alert_type: 'excessive_km' | 'unauthorized_use' | 'anomalous_fuel';
  vehicle_id: string;
  worker_id?: string;
  alert_date: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'resolved';
  reviewed_by?: string;
  reviewed_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMachineryCost {
  id: string;
  project_id: string;
  machinery_id: string;
  period: string;
  total_hours: number;
  total_cost: number;
  production_quantity?: number;
  production_unit?: string;
  cost_per_unit?: number;
  theoretical_cost?: number;
  variance?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MachineryWithDetails extends Machinery {
  worker_name?: string;
  project_name?: string;
  epi_requirements?: MachineryEpiRequirement[];
  authorized_operators?: MachineryOperatorAuthorization[];
  maintenance_history?: MachineryMaintenance[];
  recent_reports?: MachineryDailyReport[];
}

export interface VehicleWithDetails extends FleetVehicle {
  assigned_worker_name?: string;
  monthly_km_used?: number;
  km_percentage?: number;
  recent_usage?: VehicleDailyUsage[];
  maintenance_history?: VehicleMaintenance[];
  active_alerts?: VehicleAlert[];
}

export interface FleetDashboardKPI {
  total_machinery: number;
  active_machinery: number;
  maintenance_machinery: number;
  total_vehicles: number;
  active_vehicles: number;
  pending_alerts: number;
  total_daily_reports: number;
  monthly_machinery_cost: number;
  monthly_vehicle_cost: number;
}

export interface MachineryFormData {
  machinery_code: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  serial_number: string;
  license_plate: string;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  hourly_cost: number;
  status: string;
  location: string;
  requires_operator_license: boolean;
  fuel_type: string;
  fuel_capacity: number;
  max_hours_before_maintenance: number;
  notes: string;
}

export interface VehicleFormData {
  vehicle_code: string;
  license_plate: string;
  vehicle_type: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  fuel_capacity: number;
  purchase_date: string;
  purchase_price: number;
  status: string;
  assigned_to_worker_id: string;
  monthly_km_limit: number;
  insurance_company: string;
  insurance_policy: string;
  insurance_expiry: string;
  itv_expiry: string;
  notes: string;
}

export interface MachineryMonthlyCosts {
  id: string;
  machinery_id: string;
  period: string;
  year: number;
  month: number;
  rental_cost: number;
  operator_cost: number;
  fuel_cost: number;
  maintenance_cost: number;
  insurance_cost: number;
  social_security_cost: number;
  other_costs: number;
  total_costs: number;
  hours_worked: number;
  days_worked: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MachineryProfitabilityAnalysis {
  id: string;
  machinery_id: string;
  project_id?: string;
  period: string;
  year: number;
  month: number;
  billed_hours: number;
  hourly_rate: number;
  total_revenue: number;
  total_costs: number;
  gross_profit: number;
  profit_margin: number;
  is_profitable: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MachineryProfitabilitySummary {
  machinery_id: string;
  machinery_code: string;
  machinery_name: string;
  category: string;
  ownership_type: string;
  supplier_name?: string;
  monthly_rental_cost: number;
  period: string;
  year: number;
  month: number;
  rental_cost: number;
  operator_cost: number;
  fuel_cost: number;
  maintenance_cost: number;
  insurance_cost: number;
  social_security_cost: number;
  other_costs: number;
  total_costs: number;
  hours_worked: number;
  total_revenue: number;
  gross_profit: number;
  profit_margin: number;
  is_profitable: boolean;
  cost_per_hour: number;
  revenue_per_hour: number;
}

export interface SupplierMonthlyPayment {
  supplier_id: string;
  supplier_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  year: number;
  month: number;
  period: string;
  machinery_count: number;
  total_rental_cost: number;
  machinery_list: string;
}
