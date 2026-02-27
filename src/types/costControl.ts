// Tipos para el módulo de Control de Costes y Rentabilidad

export interface ProjectCostControl {
  id: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  clientId: string;
  clientName: string;
  startDate: string;
  endDate: string;
  estimatedEndDate: string;
  status: 'planning' | 'active' | 'completed' | 'paused' | 'cancelled';
  
  // Presupuesto y control
  totalBudget: number;
  budgetBreakdown: BudgetBreakdown;
  
  // Costes reales
  actualCosts: ActualCosts;
  
  // Análisis y KPIs
  analysis: ProjectAnalysis;
  
  // Responsables
  projectManager: string;
  costController: string;
  
  // Configuración
  costAllocation: CostAllocation;
  
  // Metadatos
  createdDate: string;
  lastUpdated: string;
  version: number;
}

export interface BudgetBreakdown {
  materials: number;
  directLabor: number;
  subcontracts: number;
  machinery: number;
  insurance: number;
  generalExpenses: number;
  indirectCosts: number;
  contingency: number;
  profit: number;
}

export interface ActualCosts {
  materials: CostCategory;
  directLabor: CostCategory;
  subcontracts: CostCategory;
  machinery: CostCategory;
  insurance: CostCategory;
  generalExpenses: CostCategory;
  indirectCosts: CostCategory;
  total: number;
  lastUpdated: string;
}

export interface CostCategory {
  budgeted: number;
  actual: number;
  committed: number;
  variance: number;
  variancePercentage: number;
  items: CostItem[];
}

export interface CostItem {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  source: 'treasury' | 'supplier' | 'payroll' | 'manual';
  sourceId?: string;
  reference?: string;
  status: 'planned' | 'committed' | 'paid';
  approvedBy?: string;
}

export interface ProjectAnalysis {
  // Rentabilidad
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  
  // Productividad
  costPerLinearMeter: number;
  costPerSquareMeter: number;
  costPerWorkerDay: number;
  costPerMachineHour: number;
  
  // Desviaciones
  budgetVariance: number;
  budgetVariancePercentage: number;
  timeVariance: number; // días
  
  // Indicadores
  performanceIndex: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Tendencias
  costTrend: 'improving' | 'stable' | 'deteriorating';
  productivityTrend: 'improving' | 'stable' | 'deteriorating';
}

export interface CostAllocation {
  directCostPercentage: number;
  indirectCostPercentage: number;
  overheadAllocationMethod: 'hours' | 'revenue' | 'direct_cost' | 'equal';
  overheadRate: number;
}

export interface CostAlert {
  id: string;
  projectId: string;
  projectName: string;
  type: 'budget_exceeded' | 'no_activity' | 'high_labor_cost' | 'variance_threshold' | 'cash_flow_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  createdDate: string;
  resolved: boolean;
  resolvedDate?: string;
  resolvedBy?: string;
}

export interface ProductivityMetric {
  projectId: string;
  projectName: string;
  period: string;
  
  // Métricas de productividad
  revenuePerWorker: number;
  costPerWorker: number;
  hoursPerUnit: number;
  unitsPerDay: number;
  
  // Eficiencia
  laborEfficiency: number;
  machineryUtilization: number;
  materialWaste: number;
  
  // Comparativas
  industryBenchmark: number;
  companyAverage: number;
  variance: number;
}

export interface CostReport {
  id: string;
  type: 'project_status' | 'cost_breakdown' | 'productivity' | 'variance_analysis' | 'profitability' | 'cash_flow_by_project';
  title: string;
  projectIds: string[];
  period: string;
  filters: any;
  data: any;
  generatedDate: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv';
}

export interface BenchmarkData {
  industry: string;
  region: string;
  projectType: string;
  metrics: {
    averageProfitMargin: number;
    averageCostPerSquareMeter: number;
    averageProjectDuration: number;
    averageLaborCostPercentage: number;
    averageMaterialCostPercentage: number;
  };
  lastUpdated: string;
}

export interface CostForecast {
  projectId: string;
  forecastDate: string;
  
  // Proyecciones
  projectedTotalCost: number;
  projectedCompletionDate: string;
  projectedProfit: number;
  
  // Escenarios
  optimisticScenario: ForecastScenario;
  realisticScenario: ForecastScenario;
  pessimisticScenario: ForecastScenario;
  
  // Factores de riesgo
  riskFactors: RiskFactor[];
  
  // Confianza
  confidenceLevel: number;
  assumptions: string[];
}

export interface ForecastScenario {
  totalCost: number;
  completionDate: string;
  profit: number;
  profitMargin: number;
  probability: number;
}

export interface RiskFactor {
  id: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
  financialImpact: number;
  mitigation: string;
}