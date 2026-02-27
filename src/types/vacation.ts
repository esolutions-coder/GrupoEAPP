// Tipos para el sistema de gestión de vacaciones

export interface VacationRequest {
  id: string;
  workerId: string;
  workerName: string;
  workerCategory: string;
  workerCrew: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  type: 'annual' | 'personal' | 'medical' | 'maternity' | 'paternity' | 'other';
  reason: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  coverageArrangements: string;
  emergencyContact: string;
  emergencyPhone: string;
  attachments?: VacationAttachment[];
  comments: string;
}

export interface VacationAttachment {
  id: string;
  name: string;
  type: 'medical_certificate' | 'official_document' | 'other';
  url: string;
  uploadDate: string;
}

export interface VacationBalance {
  workerId: string;
  workerName: string;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  approvedDays: number;
  remainingDays: number;
  carryOverDays: number;
  earnedDays: number;
  lastUpdated: string;
}

export interface VacationCalendar {
  date: string;
  workers: VacationCalendarWorker[];
  totalWorkers: number;
  availableWorkers: number;
  criticalCoverage: boolean;
}

export interface VacationCalendarWorker {
  workerId: string;
  workerName: string;
  workerCategory: string;
  workerCrew: string;
  vacationType: string;
  isApproved: boolean;
}

export interface VacationPolicy {
  id: string;
  name: string;
  description: string;
  category: string;
  daysPerYear: number;
  minimumNotice: number; // días
  maximumConsecutive: number; // días
  blackoutPeriods: BlackoutPeriod[];
  carryOverAllowed: boolean;
  carryOverLimit: number;
  approvalRequired: boolean;
  approvers: string[];
}

export interface BlackoutPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
  exceptions: string[];
}

export interface VacationReport {
  id: string;
  type: 'balance' | 'calendar' | 'usage' | 'planning';
  title: string;
  period: string;
  filters: any;
  data: any;
  generatedDate: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv';
}