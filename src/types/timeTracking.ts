// Tipos para el sistema de control de jornada laboral

export interface TimeEntry {
  id: string;
  workerId: string;
  workerName: string;
  workerCode: string;
  projectId: string;
  projectName: string;
  date: string;
  
  // Horarios
  clockIn?: string;
  clockOut?: string;
  breaks: BreakEntry[];
  
  // Cálculos automáticos
  totalWorkedTime: number; // en minutos
  totalBreakTime: number; // en minutos
  effectiveWorkTime: number; // en minutos
  
  // Configuración de jornada
  scheduledStart: string;
  scheduledEnd: string;
  scheduledWorkTime: number; // en minutos
  
  // Diferencias y control
  lateArrival: number; // minutos de retraso
  earlyDeparture: number; // minutos de salida anticipada
  overtime: number; // minutos de horas extra
  
  // Ubicación (opcional)
  clockInLocation?: GeolocationData;
  clockOutLocation?: GeolocationData;
  
  // Estado y validación
  status: 'active' | 'completed' | 'incomplete' | 'validated' | 'disputed';
  observations: string;
  validatedBy?: string;
  validationDate?: string;
  
  // Metadatos de seguridad
  digitalSignature: string;
  timestamp: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
}

export interface BreakEntry {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // en minutos
  type: 'lunch' | 'coffee' | 'personal' | 'other';
  description?: string;
  location?: GeolocationData;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  address?: string;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  appVersion: string;
}

export interface WorkSchedule {
  id: string;
  workerId: string;
  workerName: string;
  projectId: string;
  projectName: string;
  
  // Configuración de horario
  scheduleType: 'full_time' | 'part_time' | 'flexible' | 'rotating' | 'split' | 'continuous';
  startTime: string;
  endTime: string;
  totalHours: number;
  
  // Días laborables
  workDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  
  // Descansos programados
  scheduledBreaks: ScheduledBreak[];
  
  // Configuración especial
  allowFlexibleStart: boolean;
  flexibleStartRange: number; // minutos de flexibilidad
  allowFlexibleEnd: boolean;
  flexibleEndRange: number;
  
  // Geolocalización
  requireGeolocation: boolean;
  allowedLocations: WorkLocation[];
  locationTolerance: number; // metros
  
  // Validez
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  
  // Metadatos
  createdBy: string;
  createdDate: string;
  lastModified: string;
  modifiedBy: string;
}

export interface ScheduledBreak {
  id: string;
  name: string;
  startTime: string;
  duration: number; // minutos
  isPaid: boolean;
  isMandatory: boolean;
}

export interface WorkLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number; // metros de tolerancia
  isActive: boolean;
}

export interface AbsenceRequest {
  id: string;
  workerId: string;
  workerName: string;
  date: string;
  type: 'sick_leave' | 'personal_leave' | 'vacation' | 'permit' | 'strike' | 'other';
  startTime?: string;
  endTime?: string;
  isFullDay: boolean;
  reason: string;
  justificationDocument?: string;
  
  // Estado
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  
  // Notificaciones
  notifyHR: boolean;
  notifySupervisor: boolean;
}

export interface TimeTrackingAlert {
  id: string;
  type: 'late_arrival' | 'early_departure' | 'missing_clock_out' | 'excessive_break' | 'location_violation' | 'overtime_limit';
  workerId: string;
  workerName: string;
  projectId: string;
  date: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold?: number;
  actualValue?: number;
  
  // Estado
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedDate?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedDate?: string;
  resolution?: string;
  
  createdDate: string;
}

export interface TimeTrackingReport {
  id: string;
  type: 'daily_summary' | 'weekly_summary' | 'monthly_summary' | 'attendance' | 'overtime' | 'absences' | 'legal_compliance';
  title: string;
  period: string;
  filters: ReportFilters;
  data: any;
  generatedDate: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv';
  isLegalCompliant: boolean;
  digitalSignature?: string;
}

export interface ReportFilters {
  workerIds?: string[];
  projectIds?: string[];
  dateFrom: string;
  dateTo: string;
  includeBreaks: boolean;
  includeLocation: boolean;
  includeValidationStatus: boolean;
  groupBy?: 'worker' | 'project' | 'date';
}

export interface NotificationSettings {
  workerId: string;
  enablePushNotifications: boolean;
  reminderBeforeStart: number; // minutos
  reminderBeforeEnd: number; // minutos
  notifyOnLateArrival: boolean;
  notifyOnMissedClockOut: boolean;
  notifyOnScheduleChanges: boolean;
  preferredLanguage: 'es' | 'en' | 'ca';
}

export interface LegalCompliance {
  id: string;
  workerId: string;
  period: string; // YYYY-MM
  
  // Cumplimiento legal
  maxDailyHours: number;
  maxWeeklyHours: number;
  minRestBetweenShifts: number; // horas
  maxConsecutiveWorkDays: number;
  
  // Registro de cumplimiento
  violations: ComplianceViolation[];
  correctionsMade: ComplianceCorrection[];
  
  // Validación
  isCompliant: boolean;
  validatedBy: string;
  validationDate: string;
  digitalSignature: string;
}

export interface ComplianceViolation {
  id: string;
  date: string;
  type: 'max_daily_hours' | 'max_weekly_hours' | 'min_rest' | 'max_consecutive_days' | 'missing_breaks';
  description: string;
  severity: 'minor' | 'major' | 'critical';
  threshold: number;
  actualValue: number;
  correctionRequired: boolean;
}

export interface ComplianceCorrection {
  id: string;
  violationId: string;
  date: string;
  description: string;
  implementedBy: string;
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: string;
}

export interface TimeTrackingKPI {
  period: string;
  totalWorkers: number;
  averageWorkHours: number;
  punctualityRate: number; // porcentaje
  absenteeismRate: number; // porcentaje
  overtimeRate: number; // porcentaje
  complianceRate: number; // porcentaje
  totalAlerts: number;
  resolvedAlerts: number;
}