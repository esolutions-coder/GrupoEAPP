// Tipos para el sistema de gestión de cuadrillas destajistas

export interface CrewDestajista {
  id: string;
  nombreCuadrilla: string;
  obraAsociada: string;
  obraId: string;
  fechaCreacion: string;
  porcentajeDescuento: number; // % general a aplicar sobre el total
  activo: boolean;
  miembros: MiembroCuadrilla[];
  responsable: string;
  especialidad: string;
  observaciones: string;
  // Estadísticas
  totalPartes: number;
  totalValorGenerado: number;
  totalHorasProducidas: number;
  ultimoParteDate?: string;
}

export interface MiembroCuadrilla {
  id: string;
  idCuadrilla: string;
  idOperario: string;
  nombreOperario: string;
  categoriaOperario: string;
  precioHoraOperario: number;
  porcentajeParticipacion: number; // ej. 25%, 33.3%, etc.
  fechaIngreso: string;
  activo: boolean;
  // Estadísticas del miembro
  totalRecibido: number;
  horasEquivalentes: number;
  ultimaParticipacion?: string;
}

export interface ParteCuadrilla {
  id: string;
  idCuadrilla: string;
  nombreCuadrilla: string;
  fecha: string;
  idOperarioProductor: string;
  nombreOperarioProductor: string;
  categoriaProductor: string;
  horasEmpleadas: number;
  precioHoraProductor: number;
  totalValor: number; // horas x precio hora
  porcentajeDescuentoAplicado: number;
  valorFinalReparto: number; // total después del descuento
  observaciones: string;
  estado: 'borrador' | 'confirmado' | 'contabilizado';
  creadoPor: string;
  fechaCreacion: string;
  confirmadoPor?: string;
  fechaConfirmacion?: string;
}

export interface RepartoCuadrilla {
  id: string;
  idParte: string;
  idOperarioReceptor: string;
  nombreOperarioReceptor: string;
  porcentajeAsignado: number;
  horasEquivalentes: number; // valor proporcional en función del coste
  valorAsignado: number; // euros por operario
  estado: 'pendiente' | 'contabilizado' | 'pagado';
  fechaGeneracion: string;
  fechaContabilizacion?: string;
  observaciones?: string;
}

export interface ResumenCuadrilla {
  idCuadrilla: string;
  nombreCuadrilla: string;
  periodo: string; // YYYY-MM
  totalPartes: number;
  totalHorasProducidas: number;
  totalValorGenerado: number;
  totalValorRepartido: number;
  totalDescuentos: number;
  miembrosActivos: number;
  produccionPromedioDiaria: number;
  eficienciaRepartimiento: number; // %
  detallesMiembros: ResumenMiembroCuadrilla[];
}

export interface ResumenMiembroCuadrilla {
  idOperario: string;
  nombreOperario: string;
  porcentajeParticipacion: number;
  totalRecibido: number;
  horasEquivalentes: number;
  participacionesCount: number;
  promedioRecibidoPorParte: number;
}

export interface InformeCuadrilla {
  id: string;
  tipo: 'por_operario' | 'por_cuadrilla' | 'por_obra' | 'consolidado';
  titulo: string;
  periodo: string;
  filtros: FiltroInformeCuadrilla;
  datos: any;
  fechaGeneracion: string;
  generadoPor: string;
  formato: 'pdf' | 'excel' | 'csv';
}

export interface FiltroInformeCuadrilla {
  fechaDesde: string;
  fechaHasta: string;
  cuadrillaIds?: string[];
  operarioIds?: string[];
  obraIds?: string[];
  incluirDescuentos: boolean;
  soloActivos: boolean;
}

export interface AlertaCuadrilla {
  id: string;
  tipo: 'cuadrilla_inactiva' | 'reparto_pendiente' | 'descuento_alto' | 'miembro_inactivo' | 'parte_sin_confirmar';
  idCuadrilla: string;
  nombreCuadrilla: string;
  mensaje: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  fechaCreacion: string;
  resuelta: boolean;
  fechaResolucion?: string;
  resueltosPor?: string;
}

export interface ConfiguracionCuadrillas {
  porcentajeDescuentoDefecto: number;
  diasMaximoPartesPendientes: number;
  alertasAutomaticas: boolean;
  requiereConfirmacionPartes: boolean;
  permitirAutoAsignacion: boolean;
  limiteMiembrosPorCuadrilla: number;
}

export interface KPICuadrillas {
  periodo: string;
  totalCuadrillas: number;
  cuadrillasActivas: number;
  totalOperariosEnCuadrillas: number;
  totalValorGenerado: number;
  totalValorRepartido: number;
  eficienciaPromedioRepartimiento: number;
  produccionPromedioPorCuadrilla: number;
  horasProducidasTotal: number;
  partesRegistrados: number;
  partesPendientesConfirmacion: number;
}

// Tipos auxiliares para cálculos
export interface CalculoReparto {
  valorTotal: number;
  descuentoAplicado: number;
  valorFinalReparto: number;
  repartos: {
    idOperario: string;
    nombreOperario: string;
    porcentaje: number;
    valorAsignado: number;
    horasEquivalentes: number;
  }[];
}

export interface ValidacionCuadrilla {
  esValida: boolean;
  errores: string[];
  advertencias: string[];
}

// Simple Crew types for basic management
export interface Crew {
  id: string;
  code: string;
  name: string;
  leader_id?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CrewMember {
  id: string;
  crew_id: string;
  worker_id: string;
  joined_date: string;
  is_leader: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CrewWithMembers extends Crew {
  members: CrewMember[];
  leader_name?: string;
  member_count: number;
}

export interface CrewFormData {
  code: string;
  name: string;
  leader_id?: string;
  status: 'active' | 'inactive';
  worker_ids: string[];
}