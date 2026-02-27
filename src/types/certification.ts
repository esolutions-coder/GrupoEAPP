// Tipos específicos para el módulo de certificación de obras

export interface WorkCertification {
  id: string;
  // Identificación
  projectId: string;
  projectName: string;
  contractor: string;
  certificationNumber: string;
  issueDate: string;
  status: 'draft' | 'validated' | 'certified';
  
  // Desglose de trabajos
  certifiedItems: CertifiedItem[];
  
  // Control económico
  totalCertifiedValue: number;
  discounts: CertificationDiscount[];
  retentions: CertificationRetention[];
  deviations: CertificationDeviation[];
  comments: string;
  
  // Firmas autorizadas
  signatures: CertificationSignature[];
  
  // Documentación
  attachments: CertificationAttachment[];
  complianceChecklist: ComplianceItem[];
  
  // Metadatos
  createdBy: string;
  createdDate: string;
  lastModified: string;
  modifiedBy: string;
  version: number;
}

export interface CertifiedItem {
  id: string;
  budgetItemId: string;
  code: string;
  description: string;
  unit: string;
  unitPrice: number;
  
  // Mediciones
  accumulatedToOrigin: number;
  previousCertification: number;
  currentMeasurement: number;
  
  // Cálculos automáticos
  partialAmount: number;
  accumulatedAmount: number;
  executedPercentage: number;
  
  // Referencias
  references: string[];
  observations: string;
}

export interface CertificationDiscount {
  id: string;
  concept: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
  justification: string;
}

export interface CertificationRetention {
  id: string;
  concept: string;
  percentage: number;
  amount: number;
  releaseConditions: string;
}

export interface CertificationDeviation {
  id: string;
  budgetItemId: string;
  description: string;
  budgetedAmount: number;
  executedAmount: number;
  variance: number;
  variancePercentage: number;
  justification: string;
  approvedBy: string;
}

export interface CertificationSignature {
  id: string;
  role: 'site_manager' | 'technical_director' | 'client' | 'supervisor';
  signerName: string;
  signatureDate?: string;
  digitalSignature: boolean;
  status: 'pending' | 'signed' | 'rejected';
  comments?: string;
}

export interface CertificationAttachment {
  id: string;
  name: string;
  type: 'plan' | 'report' | 'photo' | 'document' | 'other';
  url: string;
  uploadDate: string;
  uploadedBy: string;
  description: string;
}

export interface ComplianceItem {
  id: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'pending';
  evidence?: string;
  verifiedBy?: string;
  verificationDate?: string;
}

export interface CertificationTemplate {
  id: string;
  name: string;
  projectType: string;
  defaultItems: string[];
  complianceRequirements: string[];
  signatureRoles: string[];
}