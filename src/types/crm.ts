// Tipos para el sistema CRM profesional

export interface Client {
  id: string;
  nombreComercial: string;
  razonSocial: string;
  cifNif: string;
  personaContacto: string;
  cargoContacto: string;
  emailContacto: string;
  telefonoContacto: string;
  direccionFiscal: string;
  ubicacionesObra: string[];
  fechaAlta: string;
  estadoCliente: 'activo' | 'inactivo' | 'potencial';
  necesidadesEspecificas: string;
  objetivosAcordados: string[];
  satisfaccionPromedio: number;
  valorTotal: number;
  proyectosActivos: number;
  ultimoContacto: string;
  proximaAccion: string;
  fechaProximaAccion: string;
  responsableComercial: string;
  etiquetas: string[];
  prioridad: 'alta' | 'media' | 'baja';
  origen: 'web' | 'referido' | 'comercial' | 'publicidad' | 'otro';
  observaciones: string;
}

export interface ProyectoCliente {
  id: string;
  idCliente: string;
  nombreProyecto: string;
  obraAsociada: string;
  fechaInicio: string;
  fechaEntregaPrevista: string;
  fechaEntregaReal?: string;
  estadoProyecto: 'activo' | 'finalizado' | 'cancelado' | 'pausado' | 'planificacion';
  responsableComercial: string;
  responsableTecnico: string;
  presupuestoInicial: number;
  presupuestoFinal: number;
  margenBeneficio: number;
  comentariosGenerales: string;
  documentosAdjuntos: DocumentoProyecto[];
  hitos: HitoProyecto[];
  riesgos: RiesgoProyecto[];
  satisfaccionCliente: number;
  probabilidadExito: number;
  fase: 'prospecto' | 'propuesta' | 'negociacion' | 'contratado' | 'ejecucion' | 'entregado' | 'garantia';
}

export interface DocumentoProyecto {
  id: string;
  nombre: string;
  tipo: 'contrato' | 'presupuesto' | 'plano' | 'certificado' | 'factura' | 'otro';
  url: string;
  fechaSubida: string;
  subidoPor: string;
  version: number;
  descripcion: string;
}

export interface HitoProyecto {
  id: string;
  nombre: string;
  fechaPrevista: string;
  fechaReal?: string;
  completado: boolean;
  descripcion: string;
  responsable: string;
}

export interface RiesgoProyecto {
  id: string;
  descripcion: string;
  probabilidad: 'baja' | 'media' | 'alta';
  impacto: 'bajo' | 'medio' | 'alto';
  mitigacion: string;
  estado: 'identificado' | 'mitigado' | 'materializado' | 'cerrado';
}

export interface SeguimientoComunicacion {
  id: string;
  idCliente: string;
  fecha: string;
  tipoContacto: 'llamada' | 'reunion' | 'email' | 'whatsapp' | 'visita' | 'videollamada' | 'otro';
  resumenContacto: string;
  personaAtendida: string;
  proximaAccion: string;
  fechaProximaAccion: string;
  usuarioResponsable: string;
  prioridad: 'alta' | 'media' | 'baja';
  estado: 'pendiente' | 'completado' | 'cancelado';
  duracion?: number; // en minutos
  ubicacion?: string;
  participantes: string[];
  documentosGenerados: string[];
  resultadoContacto: 'positivo' | 'neutro' | 'negativo';
  oportunidadDetectada: boolean;
  valorOportunidad?: number;
}

export interface PostVenta {
  id: string;
  idCliente: string;
  idProyecto: string;
  fechaContacto: string;
  tipoAtencion: 'reclamacion' | 'mantenimiento' | 'mejora' | 'consulta' | 'garantia' | 'ampliacion';
  detalleIncidencia: string;
  solucionAportada: string;
  estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
  responsable: string;
  prioridad: 'critica' | 'alta' | 'media' | 'baja';
  fechaResolucion?: string;
  tiempoResolucion?: number; // en horas
  satisfaccionCliente: number; // 1-5
  costeSolucion: number;
  requiereVisita: boolean;
  fechaVisita?: string;
  tecnicoAsignado?: string;
  observacionesInternas: string;
  seguimientoRequerido: boolean;
  fechaProximoSeguimiento?: string;
}

export interface AlertaCRM {
  id: string;
  tipo: 'seguimiento_pendiente' | 'cliente_inactivo' | 'proyecto_retrasado' | 'postventa_abierta' | 'oportunidad_comercial';
  idCliente: string;
  nombreCliente: string;
  mensaje: string;
  prioridad: 'critica' | 'alta' | 'media' | 'baja';
  fechaCreacion: string;
  fechaVencimiento: string;
  responsable: string;
  leida: boolean;
  resuelta: boolean;
  fechaResolucion?: string;
}

export interface InformeCRM {
  id: string;
  tipo: 'actividad_comercial' | 'satisfaccion_cliente' | 'postventa' | 'pipeline_ventas' | 'rentabilidad_cliente';
  titulo: string;
  periodo: string;
  filtros: FiltroInforme;
  datos: any;
  fechaGeneracion: string;
  generadoPor: string;
  formato: 'pdf' | 'excel' | 'csv';
}

export interface FiltroInforme {
  fechaDesde: string;
  fechaHasta: string;
  clienteIds?: string[];
  responsableComercial?: string;
  estadoCliente?: string;
  tipoProyecto?: string;
  rangoFacturacion?: { min: number; max: number };
}

export interface KPIComercial {
  periodo: string;
  clientesNuevos: number;
  clientesActivos: number;
  clientesPerdidos: number;
  tasaRetencion: number;
  valorMedioProyecto: number;
  tiempoCierrePromedio: number; // días
  satisfaccionPromedio: number;
  margenPromedioProyectos: number;
  facturacionTotal: number;
  proyectosEnCurso: number;
  proyectosCompletados: number;
  oportunidadesAbiertas: number;
  valorPipelineTotal: number;
}

export interface ConfiguracionCRM {
  recordatoriosAutomaticos: boolean;
  diasSeguimientoCliente: number;
  diasAlertaProyecto: number;
  emailsAutomaticos: boolean;
  plantillasEmail: PlantillaEmail[];
  rolesAcceso: RolAcceso[];
  integracionWhatsApp: boolean;
  integracionEmail: boolean;
}

export interface PlantillaEmail {
  id: string;
  nombre: string;
  asunto: string;
  cuerpo: string;
  tipo: 'seguimiento' | 'postventa' | 'bienvenida' | 'recordatorio' | 'satisfaccion';
  activa: boolean;
}

export interface RolAcceso {
  id: string;
  nombre: string;
  permisos: string[];
  descripcion: string;
}

export interface DashboardCRM {
  clientesTotales: number;
  clientesActivos: number;
  proyectosActivos: number;
  facturacionMensual: number;
  satisfaccionPromedio: number;
  alertasPendientes: number;
  proximosContactos: SeguimientoComunicacion[];
  clientesInactivos: Client[];
  oportunidadesCalientes: ProyectoCliente[];
  postventasPendientes: PostVenta[];
}