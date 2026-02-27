export interface WorkReport {
  id: string;
  report_number: string;
  project_id: string;
  report_date: string;
  manager: string;
  activities: string;
  status: 'draft' | 'submitted' | 'approved' | 'closed';
  month_closed: boolean;
  closed_at?: string;
  closed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface WorkReportDetail {
  id: string;
  work_report_id: string;
  worker_id: string;
  hour_type: 'admin' | 'destajo' | 'extra';
  hours_worked: number;
  crew_id?: string;
  observations?: string;
  created_at: string;
}

export interface WorkReportSignature {
  id: string;
  work_report_id: string;
  signer_name: string;
  signer_role: 'manager' | 'supervisor' | 'worker';
  signature_data: string;
  signed_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface Crew {
  id: string;
  code: string;
  name: string;
  leader_id?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface WorkReportFormData {
  project_id: string;
  report_date: string;
  manager: string;
  activities: string;
  status: 'draft' | 'submitted' | 'approved' | 'closed';
  notes?: string;
}

export interface WorkReportDetailFormData {
  worker_id: string;
  hour_type: 'admin' | 'destajo' | 'extra';
  hours_worked: number;
  crew_id?: string;
  observations?: string;
}

export interface MonthlyReportData {
  month: string;
  year: number;
  total_reports: number;
  total_hours: number;
  hours_by_type: {
    admin: number;
    destajo: number;
    extra: number;
  };
  reports_by_project: {
    project_id: string;
    project_name: string;
    total_hours: number;
  }[];
  workers_summary: {
    worker_id: string;
    worker_name: string;
    total_hours: number;
    reports_count: number;
  }[];
}
