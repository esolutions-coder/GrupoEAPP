export interface VacationBalance {
  id: string;
  worker_id: string;
  worker_name?: string;
  worker_position?: string;
  year: number;
  total_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VacationRequest {
  id: string;
  request_number: string;
  worker_id: string;
  worker_name?: string;
  worker_position?: string;
  year: number;
  start_date: string;
  end_date: string;
  total_days: number;
  vacation_type: string;
  reason?: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  requested_date: string;
  approved_by?: string;
  approved_by_name?: string;
  approved_date?: string;
  rejection_reason?: string;
  signature_data?: string;
  created_at: string;
  updated_at: string;
}

export interface VacationAlert {
  id: string;
  alert_type: 'balance_low' | 'expiring_days' | 'pending_approval' | 'request_approved' | 'request_rejected';
  worker_id: string;
  worker_name?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export type VacationType =
  | 'Vacaciones anuales'
  | 'Asuntos personales'
  | 'Permiso médico'
  | 'Permiso retribuido'
  | 'Otros';
