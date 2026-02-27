import React, { useState } from 'react';
import { Briefcase, Plus, Search, Edit, Trash2, Eye, Save, X, MapPin, Clock, Euro, Users, Calendar, CheckCircle, AlertTriangle, Download, FileText } from 'lucide-react';
import { JobOffer, JobCategory } from '../../types/jobOffers';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { showSuccessNotification } from '../../utils/modalUtils';

const JobManager: React.FC = () => {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([
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
    }
  ]);

  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const [editForm, setEditForm] = useState<Partial<JobOffer>>({});

  const categories = [
    { id: 'all', label: 'Todas las Categorías' },
    { id: 'construction', label: 'Construcción' },
    { id: 'machinery', label: 'Maquinaria' },
    { id: 'management', label: 'Gestión' },
    { id: 'technical', label: 'Técnico' },
    { id: 'safety', label: 'Seguridad' }
  ];

  const jobTypes = [
    { value: 'full-time', label: 'Tiempo Completo' },
    { value: 'part-time', label: 'Tiempo Parcial' },
    { value: 'contract', label: 'Contrato' },
    { value: 'temporary', label: 'Temporal' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Normal' },
    { value: 'medium', label: 'Prioridad' },
    { value: 'high', label: 'Urgente' }
  ];

  const filteredJobs = jobOffers.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && job.isActive) ||
                         (selectedStatus === 'inactive' && !job.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      const exportData = {
        title: 'Ofertas de Trabajo - Grupo EA',
        headers: ['Título', 'Departamento', 'Ubicación', 'Tipo', 'Experiencia', 'Salario Min', 'Salario Max', 'Candidatos', 'Estado'],
        data: filteredJobs.map(job => [
          job.title,
          job.department,
          job.location,
          getTypeLabel(job.type),
          job.experience,
          job.salary ? `€${job.salary.min.toLocaleString()}` : 'N/A',
          job.salary ? `€${job.salary.max.toLocaleString()}` : 'N/A',
          job.applicationsCount.toString(),
          job.isActive ? 'Activa' : 'Inactiva'
        ]),
        filename: `ofertas_trabajo_${new Date().toISOString().split('T')[0]}`
      };
      
      const result = exportToPDF(exportData);
      if (result.success) {
        showSuccessNotification('PDF de ofertas generado correctamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setIsLoading(true);
    try {
      const exportData = {
        title: 'Ofertas de Trabajo - Grupo EA',
        headers: ['Título', 'Departamento', 'Ubicación', 'Tipo', 'Experiencia', 'Salario Min', 'Salario Max', 'Candidatos', 'Estado'],
        data: filteredJobs.map(job => [
          job.title,
          job.department,
          job.location,
          getTypeLabel(job.type),
          job.experience,
          job.salary ? `€${job.salary.min.toLocaleString()}` : 'N/A',
          job.salary ? `€${job.salary.max.toLocaleString()}` : 'N/A',
          job.applicationsCount.toString(),
          job.isActive ? 'Activa' : 'Inactiva'
        ]),
        filename: `ofertas_trabajo_${new Date().toISOString().split('T')[0]}`
      };
      
      const result = exportToExcel(exportData);
      if (result.success) {
        showSuccessNotification('Excel de ofertas generado correctamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (job: JobOffer) => {
    setSelectedJob(job);
    setEditForm(job);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditForm({
      title: '',
      department: '',
      location: '',
      type: 'full-time',
      experience: '',
      salary: { min: 0, max: 0, currency: 'EUR' },
      description: '',
      requirements: [''],
      responsibilities: [''],
      benefits: [''],
      publishedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      applicationsCount: 0,
      urgency: 'medium',
      category: 'construction'
    });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (isCreating) {
      const newJob: JobOffer = {
        ...editForm as JobOffer,
        id: (Math.max(...jobOffers.map(j => parseInt(j.id))) + 1).toString()
      };
      setJobOffers([...jobOffers, newJob]);
      setIsCreating(false);
    } else if (selectedJob) {
      setJobOffers(jobOffers.map(j => 
        j.id === selectedJob.id ? { ...editForm as JobOffer, id: selectedJob.id } : j
      ));
      setIsEditing(false);
    }
    setEditForm({});
    setSelectedJob(null);
  };

  const handleDelete = (jobId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta oferta?')) {
      setJobOffers(jobOffers.filter(j => j.id !== jobId));
    }
  };

  const handleToggleActive = (jobId: string) => {
    setJobOffers(jobOffers.map(j => 
      j.id === jobId ? { ...j, isActive: !j.isActive } : j
    ));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setEditForm({});
    setSelectedJob(null);
  };

  const updateArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, value: string) => {
    const currentArray = editForm[field] || [''];
    const newArray = [...currentArray];
    newArray[index] = value;
    setEditForm({...editForm, [field]: newArray});
  };

  const addArrayField = (field: 'requirements' | 'responsibilities' | 'benefits') => {
    const currentArray = editForm[field] || [''];
    setEditForm({...editForm, [field]: [...currentArray, '']});
  };

  const removeArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    const currentArray = editForm[field] || [''];
    const newArray = currentArray.filter((_, i) => i !== index);
    setEditForm({...editForm, [field]: newArray});
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    const typeObj = jobTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const stats = [
    { label: 'Total Ofertas', value: jobOffers.length.toString(), icon: Briefcase, color: 'text-blue-600' },
    { label: 'Ofertas Activas', value: jobOffers.filter(j => j.isActive).length.toString(), icon: CheckCircle, color: 'text-green-600' },
    { label: 'Candidatos Totales', value: jobOffers.reduce((sum, j) => sum + j.applicationsCount, 0).toString(), icon: Users, color: 'text-purple-600' },
    { label: 'Ofertas Urgentes', value: jobOffers.filter(j => j.urgency === 'high' && j.isActive).length.toString(), icon: AlertTriangle, color: 'text-red-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Ofertas de Trabajo</h2>
          <p className="text-gray-600">Crea y administra ofertas de empleo para la web</p>
        </div>
        <div className="flex space-x-3">
          <button type="button" onClick={handleExportPDF}
            disabled={isLoading}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{isLoading ? 'Generando...' : 'PDF'}</span>
          </button>
          <button type="button" onClick={handleExportExcel}
            disabled={isLoading}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Excel</span>
          </button>
          <button type="button" onClick={handleCreate}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Oferta</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ofertas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>
      </div>

      {/* Job Offers Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Lista de Ofertas de Trabajo</h3>
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-corporate-blue-600" />
                </div>
                <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.department}</p>
                  <p className="text-xs text-gray-500">Publicada: {new Date(job.publishedDate).toLocaleDateString('es-ES')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.isActive)}`}>
                    {job.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(job.urgency)}`}>
                    {job.urgency === 'high' ? 'Urgente' : job.urgency === 'medium' ? 'Prioridad' : 'Normal'}
                  </span>
                <div className="text-right">
                  <div className="text-lg font-bold text-corporate-blue-600">{job.applicationsCount}</div>
                  <div className="text-xs text-gray-500">candidatos</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">Ubicación:</span>
                <div className="font-medium text-gray-900">{job.location}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Tipo Contrato:</span>
                <div className="font-medium text-gray-900">{getTypeLabel(job.type)}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Experiencia:</span>
                <div className="font-medium text-gray-900">{job.experience}</div>
              </div>
              {job.salary && (
                <div>
                  <span className="text-sm text-gray-600">Salario:</span>
                  <div className="font-bold text-green-600">€{job.salary.min.toLocaleString()} - €{job.salary.max.toLocaleString()}</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">Fecha Vencimiento:</span>
                <div className="text-sm text-gray-900">{new Date(job.expiryDate).toLocaleDateString('es-ES')}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Categoría:</span>
                <div className="text-sm text-gray-900">{job.category}</div>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-2">Descripción:</span>
              <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                {job.description}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                ID: {job.id} | Urgencia: {job.urgency}
              </div>
              <div className="flex space-x-2">
                <button type="button" onClick={() => setSelectedJob(job)}
                  className="text-corporate-blue-600 hover:text-corporate-blue-900"
                  title="Ver detalles"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleEdit(job)}
                  className="text-green-600 hover:text-green-900"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleToggleActive(job.id)}
                  className={`${job.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                  title={job.isActive ? 'Desactivar' : 'Activar'}
                >
                  {job.isActive ? <X className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => handleDelete(job.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && !isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                <button type="button" onClick={() => setSelectedJob(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Departamento:</strong> {selectedJob.department}</div>
                    <div><strong>Ubicación:</strong> {selectedJob.location}</div>
                    <div><strong>Tipo:</strong> {getTypeLabel(selectedJob.type)}</div>
                    <div><strong>Experiencia:</strong> {selectedJob.experience}</div>
                    {selectedJob.salary && (
                      <div><strong>Salario:</strong> €{selectedJob.salary.min.toLocaleString()} - €{selectedJob.salary.max.toLocaleString()}</div>
                    )}
                    <div><strong>Candidatos:</strong> {selectedJob.applicationsCount}</div>
                    <div><strong>Estado:</strong> {selectedJob.isActive ? 'Activa' : 'Inactiva'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
                  <p className="text-gray-600 text-sm">{selectedJob.description}</p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Requisitos</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-corporate-blue-500 mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Responsabilidades</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {selectedJob.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Beneficios</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {selectedJob.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {(isEditing || isCreating) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isCreating ? 'Crear Nueva Oferta' : 'Editar Oferta'}
                </h2>
                <button type="button" onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título del Puesto *
                      </label>
                      <input
                        type="text"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departamento *
                      </label>
                      <input
                        type="text"
                        value={editForm.department || ''}
                        onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación *
                      </label>
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experiencia Requerida *
                      </label>
                      <input
                        type="text"
                        value={editForm.experience || ''}
                        onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                        placeholder="ej: 2-5 años"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Contrato *
                      </label>
                      <select
                        value={editForm.type || 'full-time'}
                        onChange={(e) => setEditForm({...editForm, type: e.target.value as any})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      >
                        {jobTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría *
                      </label>
                      <select
                        value={editForm.category || 'construction'}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value as any})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      >
                        <option value="construction">Construcción</option>
                        <option value="machinery">Maquinaria</option>
                        <option value="management">Gestión</option>
                        <option value="technical">Técnico</option>
                        <option value="safety">Seguridad</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgencia *
                      </label>
                      <select
                        value={editForm.urgency || 'medium'}
                        onChange={(e) => setEditForm({...editForm, urgency: e.target.value as any})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      >
                        {urgencyLevels.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Vencimiento *
                      </label>
                      <input
                        type="date"
                        value={editForm.expiryDate || ''}
                        onChange={(e) => setEditForm({...editForm, expiryDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Salary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Salario</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salario Mínimo (EUR)
                      </label>
                      <input
                        type="number"
                        value={editForm.salary?.min || ''}
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          salary: { ...editForm.salary, min: parseInt(e.target.value) || 0, max: editForm.salary?.max || 0, currency: 'EUR' }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salario Máximo (EUR)
                      </label>
                      <input
                        type="number"
                        value={editForm.salary?.max || ''}
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          salary: { ...editForm.salary, min: editForm.salary?.min || 0, max: parseInt(e.target.value) || 0, currency: 'EUR' }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Puesto *
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requisitos *
                  </label>
                  {(editForm.requirements || ['']).map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateArrayField('requirements', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                        placeholder="Requisito..."
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('requirements', index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('requirements')}
                    className="text-corporate-blue-600 hover:text-corporate-blue-700 text-sm font-medium"
                  >
                    + Agregar requisito
                  </button>
                </div>

                {/* Responsibilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsabilidades *
                  </label>
                  {(editForm.responsibilities || ['']).map((resp, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={resp}
                        onChange={(e) => updateArrayField('responsibilities', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                        placeholder="Responsabilidad..."
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('responsibilities', index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('responsibilities')}
                    className="text-corporate-blue-600 hover:text-corporate-blue-700 text-sm font-medium"
                  >
                    + Agregar responsabilidad
                  </button>
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beneficios *
                  </label>
                  {(editForm.benefits || ['']).map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => updateArrayField('benefits', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                        placeholder="Beneficio..."
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('benefits', index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('benefits')}
                    className="text-corporate-blue-600 hover:text-corporate-blue-700 text-sm font-medium"
                  >
                    + Agregar beneficio
                  </button>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 px-6 py-3 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>{isCreating ? 'Crear Oferta' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManager;