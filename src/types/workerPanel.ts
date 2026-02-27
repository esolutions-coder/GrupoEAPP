// Tipos para el panel personal de operarios

export interface WorkerSummary {
  workerId: string;
  workerName: string;
  period: string; // YYYY-MM
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  totalProjects: number;
  totalEarnings: number;
  workDays: number;
}

export interface WorkerWorkReport {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  regularHours: number;
  overtimeHours: number;
  nightHours: number;
  holidayHours: number;
  totalHours: number;
  activities: string[];
  observations: string;
  status: 'approved' | 'pending' | 'rejected';
  approvedBy?: string;
  approvalDate?: string;
}

export interface WorkerProject {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate?: string;
  totalHours: number;
  role: string;
  status: 'active' | 'completed';
}

export interface WorkerNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface WorkerProfile {
  id: string;
  personalData: {
    firstName: string;
    lastName: string;
    dni: string;
    phone: string;
    email: string;
    address: string;
    city: string;
  };
  professionalData: {
    category: string;
    crew: string;
    startDate: string;
    prlCertifications: string[];
    prlExpiryDate: string;
  };
  currentProject?: {
    id: string;
    name: string;
    role: string;
    startDate: string;
  };
}