export type SMACStatus =
  | 'presentado'
  | 'citado'
  | 'conciliado'
  | 'sin_avenencia'
  | 'demanda_judicial'
  | 'juicio_pendiente'
  | 'sentencia_pendiente'
  | 'resuelto_favorable'
  | 'resuelto_desfavorable'
  | 'desistimiento'
  | 'caducado';

export type ClaimType =
  | 'despido_improcedente'
  | 'despido_nulo'
  | 'despido_disciplinario'
  | 'finiquito'
  | 'indemnizacion'
  | 'cantidad'
  | 'salarios'
  | 'horas_extras'
  | 'vacaciones'
  | 'modificacion_sustancial'
  | 'acoso'
  | 'seguridad_social'
  | 'otros';

export type ResolutionType =
  | 'conciliacion'
  | 'sentencia_favorable'
  | 'sentencia_desfavorable'
  | 'sentencia_parcial'
  | 'desistimiento'
  | 'caducidad'
  | 'archivo';

export interface SMACRecord {
  id: string;

  // Identificación del procedimiento
  smac_number: string; // Número de SMAC
  judicial_number?: string; // Número de procedimiento judicial
  presentation_date: string;
  conciliation_date?: string;
  trial_date?: string;
  resolution_date?: string;

  // Datos del trabajador demandante
  worker_id?: string; // Relación con tabla workers
  worker_name: string;
  worker_dni: string;
  worker_phone?: string;
  worker_email?: string;
  worker_category?: string; // Categoría profesional del trabajador
  entry_date: string; // Fecha alta en empresa
  exit_date: string; // Fecha baja en empresa
  position: string; // Puesto de trabajo
  last_salary: number;

  // Datos de la reclamación
  claim_types: ClaimType[];
  claim_description: string;
  claimed_amount: number; // Cantidad reclamada

  // Estado del procedimiento
  status: SMACStatus;
  current_phase: string;

  // Resolución y acuerdos
  resolution_type?: ResolutionType;
  conciliation_achieved: boolean;
  conciliation_amount?: number;
  settlement_amount?: number; // Cantidad final pagada
  payment_date?: string;
  payment_method?: string;

  // Nuevos campos de resolución
  agreement_reached: boolean; // Si se llegó a un acuerdo
  agreement_amount?: number; // Importe del acuerdo
  actual_paid_amount: number; // Cantidad realmente pagada
  is_favorable?: boolean; // Si la resolución fue favorable
  deviation_amount: number; // Desviación (pagado - reclamado)

  // Representación legal
  our_lawyer?: string;
  worker_lawyer?: string;
  labor_court?: string; // Juzgado de lo Social

  // Costas y gastos
  legal_costs: number;
  court_fees: number;
  settlement_costs: number;
  total_cost: number; // Coste total del procedimiento

  // Documentación
  documents: {
    name: string;
    type: string;
    url: string;
    uploaded_date: string;
  }[];

  // Calendario y actuaciones
  actions: {
    date: string;
    type: string;
    description: string;
    responsible?: string;
    completed: boolean;
  }[];

  // Observaciones y seguimiento
  notes: string;
  risk_level: 'bajo' | 'medio' | 'alto' | 'critico';
  probability_loss: number; // Probabilidad de perder (0-100%)

  // Control interno
  assigned_to?: string; // Responsable interno
  project_id?: string; // Proyecto donde trabajaba
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SMACStats {
  total_cases: number;
  active_cases: number;
  resolved_cases: number;

  // Por estado
  by_status: Record<SMACStatus, number>;

  // Por tipo de reclamación
  by_claim_type: Record<ClaimType, number>;

  // Económicos
  total_claimed: number;
  total_settled: number;
  total_costs: number;
  average_settlement: number;

  // Nuevas métricas económicas
  total_paid: number; // Total realmente pagado
  total_deviation: number; // Desviación total (pagado - reclamado)
  paid_to_claimed_ratio: number; // Ratio Pagado/Reclamado (%)
  smac_to_workers_ratio: number; // Ratio SMAC/Trabajadores

  // Tasas de éxito
  conciliation_rate: number;
  favorable_resolution_rate: number;

  // Temporales
  average_duration_days: number;
  pending_trials: number;

  // Por año
  cases_by_year: {
    year: number;
    count: number;
    total_cost: number;
  }[];
}

export interface SMACAlert {
  id: string;
  smac_id: string;
  alert_type: 'deadline' | 'action_required' | 'trial_date' | 'payment_due';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  resolved: boolean;
}

export interface SMACTemplate {
  id: string;
  name: string;
  document_type: 'contestacion' | 'escrito' | 'recurso' | 'acuerdo' | 'otros';
  content: string;
  variables: string[];
}

export interface LegalPrecedent {
  id: string;
  case_number: string;
  court: string;
  date: string;
  summary: string;
  relevant_for: ClaimType[];
  outcome: string;
  key_points: string[];
}
