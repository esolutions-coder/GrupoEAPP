// Tipos para el sistema de gestión de maquinaria

export interface Machine {
  id: string;
  code: string;
  name: string;
  type: MachineType;
  brand: string;
  model: string;
  serialNumber: string;
  registrationNumber?: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  status: 'operational' | 'maintenance' | 'repair' | 'out_of_service' | 'rented';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Ubicación y asignación
  currentLocation: string;
  assignedProject?: string;
  assignedOperator?: string;
  
  // Operación
  totalHours: number;
  hoursThisMonth: number;
  fuelLevel: number;
  fuelCapacity: number;
  fuelType: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  
  // Mantenimiento
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceInterval: number; // horas
  maintenanceHistory: MaintenanceRecord[];
  
  // Documentación
  insurance: InsuranceInfo;
  technicalInspection: TechnicalInspection;
  operatorLicense: string;
  manuals: Document[];
  photos: string[];
  
  // Costes
  operatingCostPerHour: number;
  maintenanceCostTotal: number;
  
  // Metadatos
  createdBy: string;
  createdDate: string;
  lastModified: string;
  modifiedBy: string;
}

export interface MachineType {
  id: string;
  name: string;
  category: 'excavation' | 'lifting' | 'transport' | 'compaction' | 'concrete' | 'other';
  icon: string;
  requiresLicense: boolean;
  averageLifespan: number; // años
  maintenanceInterval: number; // horas
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  date: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  description: string;
  partsReplaced: MaintenancePart[];
  laborHours: number;
  totalCost: number;
  performedBy: string;
  nextMaintenanceHours: number;
  observations: string;
  photos: string[];
  invoices: string[];
}

export interface MaintenancePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  warranty: number; // meses
}

export interface InsuranceInfo {
  company: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  coverage: number;
  premium: number;
  isActive: boolean;
}

export interface TechnicalInspection {
  lastInspection: string;
  nextInspection: string;
  result: 'passed' | 'failed' | 'conditional';
  inspector: string;
  observations: string;
  certificateNumber: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'manual' | 'certificate' | 'invoice' | 'report' | 'other';
  url: string;
  uploadDate: string;
  uploadedBy: string;
}

export interface MachineAlert {
  id: string;
  machineId: string;
  machineName: string;
  type: 'maintenance_due' | 'fuel_low' | 'inspection_due' | 'insurance_expiry' | 'breakdown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold?: number;
  currentValue?: number;
  dueDate?: string;
  createdDate: string;
  resolved: boolean;
  resolvedDate?: string;
  resolvedBy?: string;
}

export interface MachineUsage {
  id: string;
  machineId: string;
  machineName: string;
  projectId: string;
  projectName: string;
  operatorId: string;
  operatorName: string;
  date: string;
  startTime: string;
  endTime?: string;
  hoursWorked: number;
  fuelConsumed: number;
  activities: string[];
  observations: string;
  location: string;
  status: 'active' | 'completed' | 'paused';
}

export interface MachineReport {
  id: string;
  type: 'usage' | 'maintenance' | 'costs' | 'efficiency' | 'availability';
  title: string;
  period: string;
  filters: any;
  data: any;
  generatedDate: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv';
}

export interface MachineKPI {
  period: string;
  totalMachines: number;
  operationalMachines: number;
  availabilityRate: number; // porcentaje
  utilizationRate: number; // porcentaje
  maintenanceCostRate: number; // coste/hora
  averageAge: number; // años
  totalOperatingHours: number;
  fuelEfficiency: number; // litros/hora
  breakdownRate: number; // averías por 1000 horas
}