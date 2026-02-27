import { JobOffer, JobCategory } from '../types/jobOffers';

export const jobCategories: JobCategory[] = [
  { id: 'construction', name: 'Construcción', icon: '🏗️', count: 8 },
  { id: 'machinery', name: 'Maquinaria', icon: '🚜', count: 4 },
  { id: 'management', name: 'Gestión', icon: '👔', count: 3 },
  { id: 'technical', name: 'Técnico', icon: '⚙️', count: 5 },
  { id: 'safety', name: 'Seguridad', icon: '🦺', count: 2 }
];

export const jobOffers: JobOffer[] = [
  {
    id: '1',
    title: 'Oficial de Albañilería',
    department: 'Construcción',
    location: 'Valencia, España',
    type: 'full-time',
    experience: '2-5 años',
    salary: { min: 1800, max: 2200, currency: 'EUR' },
    description: 'Buscamos oficial de albañilería con experiencia para proyectos de edificación residencial y comercial en Valencia y alrededores.',
    requirements: [
      'Mínimo 2 años de experiencia en albañilería',
      'Conocimiento de técnicas de construcción tradicionales y modernas',
      'Capacidad para leer planos y seguir especificaciones técnicas',
      'Formación en PRL (20 horas mínimo)',
      'Disponibilidad para trabajar en diferentes ubicaciones'
    ],
    responsibilities: [
      'Realizar trabajos de albañilería en obra nueva y rehabilitación',
      'Colocación de ladrillos, bloques y elementos prefabricados',
      'Aplicación de morteros y revestimientos',
      'Colaborar con otros oficios en la coordinación de trabajos',
      'Mantener el orden y limpieza en el área de trabajo'
    ],
    benefits: [
      'Salario competitivo según experiencia',
      'Contrato indefinido tras período de prueba',
      'Formación continua en nuevas técnicas',
      'Seguro médico privado',
      'Plus por trabajos en altura',
      'Transporte a obra incluido'
    ],
    publishedDate: '2025-01-25',
    expiryDate: '2025-02-25',
    isActive: true,
    applicationsCount: 12,
    urgency: 'high',
    category: 'construction'
  },
  {
    id: '2',
    title: 'Operador de Excavadora',
    department: 'Maquinaria',
    location: 'Alicante, España',
    type: 'full-time',
    experience: '3+ años',
    salary: { min: 2000, max: 2500, currency: 'EUR' },
    description: 'Necesitamos operador de excavadora experimentado para proyectos de movimientos de tierras y obra civil.',
    requirements: [
      'Carnet de operador de maquinaria pesada',
      'Mínimo 3 años de experiencia con excavadoras',
      'Conocimiento de diferentes tipos de excavadoras (20T-40T)',
      'Formación PRL específica para maquinaria',
      'Carnet de conducir B'
    ],
    responsibilities: [
      'Operar excavadoras en trabajos de excavación y movimiento de tierras',
      'Realizar mantenimiento básico de la maquinaria',
      'Seguir protocolos de seguridad estrictos',
      'Coordinar con capataces y otros operarios',
      'Mantener registros de trabajo diario'
    ],
    benefits: [
      'Salario base + incentivos por productividad',
      'Formación en nuevos modelos de maquinaria',
      'Oportunidades de especialización',
      'Seguro de vida y accidentes',
      'Vacaciones adicionales por antigüedad'
    ],
    publishedDate: '2025-01-20',
    expiryDate: '2025-02-20',
    isActive: true,
    applicationsCount: 8,
    urgency: 'medium',
    category: 'machinery'
  },
  {
    id: '3',
    title: 'Jefe de Obra',
    department: 'Gestión',
    location: 'Castellón, España',
    type: 'full-time',
    experience: '5+ años',
    salary: { min: 3500, max: 4500, currency: 'EUR' },
    description: 'Buscamos jefe de obra con amplia experiencia para liderar proyectos de construcción de gran envergadura.',
    requirements: [
      'Titulación en Ingeniería Civil, Arquitectura Técnica o similar',
      'Mínimo 5 años de experiencia como jefe de obra',
      'Conocimiento de normativas de construcción y seguridad',
      'Experiencia en gestión de equipos multidisciplinares',
      'Dominio de software de gestión de proyectos'
    ],
    responsibilities: [
      'Planificar y coordinar todas las actividades de la obra',
      'Supervisar el cumplimiento de plazos y presupuestos',
      'Gestionar equipos de trabajo y subcontratistas',
      'Asegurar el cumplimiento de normativas de seguridad',
      'Reportar avances a la dirección técnica'
    ],
    benefits: [
      'Salario competitivo + variable por objetivos',
      'Vehículo de empresa',
      'Formación en liderazgo y gestión',
      'Oportunidades de crecimiento profesional',
      'Participación en proyectos de gran prestigio'
    ],
    publishedDate: '2025-01-15',
    expiryDate: '2025-03-15',
    isActive: true,
    applicationsCount: 5,
    urgency: 'high',
    category: 'management'
  },
  {
    id: '4',
    title: 'Soldador Especializado',
    department: 'Técnico',
    location: 'Valencia, España',
    type: 'full-time',
    experience: '3+ años',
    salary: { min: 2200, max: 2800, currency: 'EUR' },
    description: 'Soldador especializado en estructuras metálicas para proyectos industriales y de obra civil.',
    requirements: [
      'Certificación en soldadura (TIG, MIG, Electrodo)',
      'Experiencia en soldadura de estructuras metálicas',
      'Capacidad para trabajar en altura',
      'Formación PRL específica para soldadura',
      'Disponibilidad para desplazamientos'
    ],
    responsibilities: [
      'Realizar soldaduras de alta calidad en estructuras metálicas',
      'Interpretar planos y especificaciones técnicas',
      'Preparar materiales y equipos de soldadura',
      'Controlar la calidad de las soldaduras realizadas',
      'Mantener equipos en perfecto estado'
    ],
    benefits: [
      'Plus por trabajos especializados',
      'Formación en nuevas técnicas de soldadura',
      'Equipos de protección de alta gama',
      'Reconocimiento por calidad del trabajo',
      'Estabilidad laboral'
    ],
    publishedDate: '2025-01-22',
    expiryDate: '2025-02-22',
    isActive: true,
    applicationsCount: 15,
    urgency: 'medium',
    category: 'technical'
  },
  {
    id: '5',
    title: 'Peón de Construcción',
    department: 'Construcción',
    location: 'Valencia, España',
    type: 'full-time',
    experience: '0-2 años',
    salary: { min: 1400, max: 1600, currency: 'EUR' },
    description: 'Oportunidad para personas que quieren iniciar su carrera en construcción. Formación incluida.',
    requirements: [
      'Ganas de aprender y trabajar en equipo',
      'Buena condición física',
      'Disponibilidad horaria completa',
      'Formación PRL básica (se puede obtener con nosotros)',
      'Actitud positiva y responsable'
    ],
    responsibilities: [
      'Apoyo en tareas generales de construcción',
      'Transporte de materiales y herramientas',
      'Limpieza y mantenimiento de obra',
      'Asistir a oficiales en sus tareas',
      'Seguir instrucciones de seguridad'
    ],
    benefits: [
      'Formación completa pagada por la empresa',
      'Oportunidades de crecimiento profesional',
      'Ambiente de trabajo familiar',
      'Posibilidad de especialización',
      'Contrato estable tras formación'
    ],
    publishedDate: '2025-01-28',
    expiryDate: '2025-03-28',
    isActive: true,
    applicationsCount: 25,
    urgency: 'low',
    category: 'construction'
  },
  {
    id: '6',
    title: 'Coordinador de Seguridad',
    department: 'Seguridad',
    location: 'Comunidad Valenciana',
    type: 'full-time',
    experience: '4+ años',
    salary: { min: 3000, max: 3800, currency: 'EUR' },
    description: 'Coordinador de seguridad y salud para supervisar el cumplimiento de normativas en nuestras obras.',
    requirements: [
      'Titulación como Coordinador de Seguridad y Salud',
      'Experiencia mínima de 4 años en el sector',
      'Conocimiento profundo de normativas PRL',
      'Capacidad de liderazgo y comunicación',
      'Disponibilidad para visitar múltiples obras'
    ],
    responsibilities: [
      'Elaborar planes de seguridad y salud',
      'Realizar inspecciones periódicas de seguridad',
      'Formar a trabajadores en prevención de riesgos',
      'Investigar incidentes y proponer mejoras',
      'Coordinar con organismos oficiales'
    ],
    benefits: [
      'Vehículo de empresa',
      'Formación continua especializada',
      'Reconocimiento profesional',
      'Participación en proyectos importantes',
      'Seguro de responsabilidad civil'
    ],
    publishedDate: '2025-01-18',
    expiryDate: '2025-02-18',
    isActive: true,
    applicationsCount: 3,
    urgency: 'high',
    category: 'safety'
  }
];