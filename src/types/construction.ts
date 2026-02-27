// Tipos para el sistema completo de gestión de obras

export interface Worker {
  id: string;
  workerCode: string; // Código único del operario
  personalData: {
    firstName: string;
    lastName: string;
    dni: string;
    dniExpiryDate: string; // Fecha caducidad DNI/NIE
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    email: string;
    emergencyContact: string;
    emergencyPhone: string;
    hasDriverLicense: boolean; // Carnet de conducir
    hasOwnVehicle: boolean; // Vehículo propio
  };
  professionalData: {
    category: 'Oficial' | 'Ayudante' | 'Peón' | 'Maquinista' | 'Especialista';
    prlType: string; // Tipo específico de PRL
    prlTraining: string[]; // Formaciones adicionales
    prlExpiryDate: string;
    medicalCheckDate: string;
    medicalCheckExpiry: string;
    epiDeliveryDate: string;
  };
  contract: {
    type: 'hourly' | 'monthly';
    hourlyRate?: number;
    monthlyRate?: number;
    overtimeRate?: number;
    hireDate: string; // Fecha de alta
    terminationDate?: string; // Fecha de baja
    endDate?: string;
  };
  vacations: {
    totalDays: number;
    usedDays: number;
    pendingDays: number;
    year: number;
  };
  documents: {
    dniExpiry: string;
    contractSigned: boolean;
    bankAccount: string;
    digitalAccess?: {
      username: string;
      password: string;
      hasAccess: boolean;
      lastLogin?: string;
    };
  };
  status: 'active' | 'inactive' | 'vacation' | 'sick';
  workHistory: WorkHistory[];
  monthlySummary?: WorkerMonthlySummary[]; // Resumen mensual de horas
  payrollHistory?: WorkerPayrollSummary[]; // Historial de liquidaciones
}

export interface WorkerMonthlySummary {
  workerId: string;
  period: string; // YYYY-MM
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  nightHours: number;
  holidayHours: number;
  workDays: number;
  totalProjects: number;
  estimatedEarnings: number;
  workReportIds: string[];
  lastUpdated: string;
}

export interface WorkerPayrollSummary {
  workerId: string;
  period: string;
  grossSalary: number;
  netSalary: number;
  totalDeductions: number;
  totalAdditions: number;
  status: 'draft' | 'calculated' | 'approved' | 'paid';
  payrollId: string;
  paymentDate?: string;
}

export interface WorkHistory {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate?: string;
  role: string;
  totalHours: number;
  totalEarnings: number;
}

export interface Client {
  id: string;
  name: string;
  type: 'public' | 'private';
  cif: string;
  address: string;
  city: string;
  postalCode: string;
  contacts: ClientContact[];
  contracts: Contract[];
  accessRoles: string[];
  documents: ClientDocument[];
  status: 'active' | 'inactive';
  createdDate: string;
}

export interface ClientContact {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface Contract {
  id: string;
  title: string;
  signDate: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'active' | 'completed' | 'cancelled';
  digitalSignature: boolean;
}

export interface ClientDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  url: string;
}

export interface Supplier {
  id: string;
  name: string;
  cif: string;
  category: 'materials' | 'equipment' | 'services' | 'subcontractor';
  address: string;
  contacts: SupplierContact[];
  contracts: SupplierContract[];
  orders: PurchaseOrder[];
  deliveries: Delivery[];
  invoices: Invoice[];
  payments: Payment[];
  incidents: Incident[];
  internalNotes: string[];
  status: 'active' | 'inactive' | 'blocked';
}

export interface SupplierContact {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface SupplierContract {
  id: string;
  title: string;
  signDate: string;
  amount: number;
  terms: string;
  expiryDate: string;
}

export interface PurchaseOrder {
  id: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
}

export interface OrderItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Delivery {
  id: string;
  orderId: string;
  date: string;
  items: DeliveryItem[];
  deliveryNote: string;
  received: boolean;
  receivedBy: string;
}

export interface DeliveryItem {
  description: string;
  quantityOrdered: number;
  quantityDelivered: number;
  unit: string;
  condition: 'good' | 'damaged' | 'incomplete';
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  method: 'transfer' | 'check' | 'cash';
  reference: string;
}

export interface Incident {
  id: string;
  date: string;
  type: 'delivery' | 'quality' | 'payment' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  resolution?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  responsible: string;
  startDate: string;
  endDate: string;
  estimatedEndDate: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  adminHourlyRate: {
    workers: number;
    machinery: number;
  };
  budget: ProjectBudget;
  measurements: Measurement[];
  certifications: Certification[];
  analysis: ProjectAnalysis;
  qualitySafety: QualitySafety;
  documentation: ProjectDocument[];
  location: string;
  description: string;
}

export interface ProjectBudget {
  id: string;
  version: number;
  chapters: BudgetChapter[];
  totalAmount: number;
  lastModified: string;
  modifiedBy: string;
  changeLog: BudgetChange[];
}

export interface BudgetChapter {
  id: string;
  code: string;
  title: string;
  items: BudgetItem[];
  totalAmount: number;
}

export interface BudgetItem {
  id: string;
  code: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  references: string[];
}

export interface BudgetChange {
  date: string;
  user: string;
  description: string;
  previousAmount: number;
  newAmount: number;
}

export interface Measurement {
  id: string;
  chapterId: string;
  itemId: string;
  period: string;
  quantity: number;
  unit: string;
  description: string;
  references: string[];
  measuredBy: string;
  approvedBy?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface Certification {
  id: string;
  number: string;
  period: string;
  type: 'origin' | 'previous' | 'current';
  items: CertificationItem[];
  totalAmount: number;
  deviations: number;
  discounts: number;
  authorizedSignatures: string[];
  status: 'draft' | 'submitted' | 'approved' | 'paid';
  submissionDate: string;
  approvalDate?: string;
}

export interface CertificationItem {
  budgetItemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface ProjectAnalysis {
  directCosts: number;
  indirectCosts: number;
  totalCosts: number;
  revenue: number;
  profitability: number;
  economicControl: EconomicControl[];
}

export interface EconomicControl {
  date: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  notes: string;
}

export interface QualitySafety {
  incidents: SafetyIncident[];
  inspections: QualityInspection[];
  measures: SafetyMeasure[];
}

export interface SafetyIncident {
  id: string;
  date: string;
  type: 'accident' | 'near_miss' | 'unsafe_condition';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  involvedPersons: string[];
  measures: string[];
  resolved: boolean;
}

export interface QualityInspection {
  id: string;
  date: string;
  inspector: string;
  area: string;
  result: 'passed' | 'failed' | 'conditional';
  observations: string;
  correctionsMade: string[];
}

export interface SafetyMeasure {
  id: string;
  date: string;
  type: string;
  description: string;
  responsible: string;
  implemented: boolean;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'photo' | 'plan' | 'report' | 'certificate' | 'other';
  url: string;
  uploadDate: string;
  uploadedBy: string;
  version: number;
  modifications: DocumentModification[];
}

export interface DocumentModification {
  date: string;
  user: string;
  description: string;
  previousVersion: number;
}

export interface WorkReport {
  id: string;
  projectId: string;
  date: string;
  responsible: string;
  activities: string[];
  workers: WorkReportWorker[];
  signature: string;
  status: 'draft' | 'submitted' | 'approved';
  submissionDate?: string;
  approvalDate?: string;
}

export interface WorkReportWorker {
  workerId: string;
  workerName: string;
  category: string;
  hourType: 'admin' | 'piecework';
  crewId?: string;
  crewName?: string;
  regularHours: number;
  overtimeHours: number;
  nightHours: number;
  holidayHours: number;
  observations: string;
}

export interface Crew {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  members: string[];
  memberNames: string[];
  status: 'active' | 'inactive';
  specialization: string;
  currentProject?: string;
}

export interface Payroll {
  id: string;
  workerId: string;
  workerName: string;
  workerCategory: string;
  period: string;
  projectId?: string;
  projectName?: string;
  regularHours: number;
  overtimeHours: number;
  nightHours: number;
  holidayHours: number;
  bonusHours: number;
  
  // Incidencias y ausencias
  absences: PayrollAbsence[];
  permits: PayrollPermit[];
  
  // Cálculos base
  hourlyRate: number;
  overtimeRate: number;
  nightRate: number;
  holidayRate: number;
  
  grossSalary: number;
  deductions: PayrollDeduction[];
  additions: PayrollAddition[];
  netSalary: number;
  
  // Control y estado
  status: 'draft' | 'calculated' | 'approved' | 'paid';
  calculatedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  paidDate?: string;
  
  // Vinculación con partes de trabajo
  workReportIds: string[];
  
  // Metadatos
  createdBy: string;
  createdDate: string;
  lastModified: string;
  modifiedBy: string;
  version: number;
}

export interface PayrollDeduction {
  id: string;
  type: 'irpf' | 'social_security' | 'garnishment' | 'sanction' | 'advance' | 'other';
  description: string;
  amount: number;
  percentage?: number;
  reference?: string;
  justification?: string;
}

export interface PayrollAddition {
  id: string;
  type: 'allowance' | 'bonus' | 'prize' | 'overtime' | 'diet' | 'plus' | 'variable' | 'other';
  description: string;
  amount: number;
  reference?: string;
  justification?: string;
}

export interface PayrollAbsence {
  id: string;
  date: string;
  type: 'justified' | 'unjustified' | 'medical' | 'personal';
  hours: number;
  description: string;
  documentReference?: string;
  approvedBy?: string;
}

export interface PayrollPermit {
  id: string;
  date: string;
  type: 'medical' | 'personal' | 'family' | 'official' | 'other';
  hours: number;
  description: string;
  paid: boolean;
  documentReference?: string;
  approvedBy?: string;
}

export interface Report {
  id: string;
  type: 'budget_vs_actual' | 'profitability' | 'worker_performance' | 'project_status' | 'financial';
  title: string;
  parameters: ReportParameters;
  data: any;
  generatedDate: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv';
}

export interface ReportParameters {
  dateFrom: string;
  dateTo: string;
  projectIds?: string[];
  workerIds?: string[];
  clientIds?: string[];
  filters: { [key: string]: any };
}
</parameter>