import React, { useState } from 'react';
import { Camera, Plus, Search, Edit, Trash2, Eye, Upload, Save, X, Building2, MapPin, Calendar, User, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  category: 'civil' | 'building' | 'earthworks' | 'canalizaciones';
  status: 'completed' | 'in-progress' | 'planning';
  location: string;
  year: string;
  client: string;
  image: string;
  description: string;
  technicalDetails: string;
  budget?: number;
  progress?: number;
  startDate?: string;
  endDate?: string;
  team?: number;
}

const ProjectGallery: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: 'Construcción Autopista A-7 Tramo Málaga-Estepona',
      category: 'civil',
      status: 'completed',
      location: 'Málaga, España',
      year: '2023',
      client: 'Ministerio de Transportes',
      image: 'https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Construcción de 15km de autopista con 3 carriles por sentido, incluyendo 2 viaductos de 200m cada uno y sistema de drenaje integral.',
      technicalDetails: 'Movimiento de tierras: 850.000 m³, Hormigón: 45.000 m³, Asfalto: 120.000 m²',
      budget: 2400000,
      progress: 100,
      startDate: '2022-01-15',
      endDate: '2023-12-20',
      team: 45
    },
    {
      id: 2,
      title: 'Complejo Residencial Las Torres del Mar',
      category: 'building',
      status: 'completed',
      location: 'Valencia, España',
      year: '2023',
      client: 'Inmobiliaria Mediterránea S.L.',
      image: 'https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: '120 viviendas distribuidas en 4 torres de 15 plantas cada una, con garaje subterráneo de 3 niveles y zonas comunes.',
      technicalDetails: 'Superficie construida: 28.500 m², Cimentación: Pilotes de 18m, Estructura: Hormigón armado',
      budget: 1800000,
      progress: 100,
      startDate: '2022-02-01',
      endDate: '2023-11-30',
      team: 32
    },
    {
      id: 3,
      title: 'Excavación Centro Comercial Aqua Multiespacio',
      category: 'earthworks',
      status: 'in-progress',
      location: 'Alicante, España',
      year: '2024',
      client: 'Grupo Inmobiliario Costa Blanca',
      image: 'https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Excavación de 50.000m³ para cimentación de centro comercial de 3 plantas subterráneas y sistema de contención.',
      technicalDetails: 'Profundidad: 12m, Muros pantalla: 1.200 m², Sistema de achique: 8 pozos',
      budget: 3200000,
      progress: 65,
      startDate: '2024-01-10',
      endDate: '2024-08-15',
      team: 28
    }
  ]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [editForm, setEditForm] = useState<Partial<Project>>({});

  const categories = [
    { id: 'all', label: 'Todas las Categorías' },
    { id: 'civil', label: 'Obra Civil' },
    { id: 'building', label: 'Edificación' },
    { id: 'earthworks', label: 'Movimientos de Tierras' },
    { id: 'canalizaciones', label: 'Canalizaciones' }
  ];

  const statuses = [
    { id: 'all', label: 'Todos los Estados' },
    { id: 'completed', label: 'Completados' },
    { id: 'in-progress', label: 'En Ejecución' },
    { id: 'planning', label: 'En Planificación' }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setEditForm(project);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditForm({
      title: '',
      category: 'civil',
      status: 'planning',
      location: '',
      year: new Date().getFullYear().toString(),
      client: '',
      image: '',
      description: '',
      technicalDetails: '',
      budget: 0,
      progress: 0,
      team: 0
    });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (isCreating) {
      const newProject: Project = {
        ...editForm as Project,
        id: Math.max(...projects.map(p => p.id)) + 1
      };
      setProjects([...projects, newProject]);
      setIsCreating(false);
    } else if (selectedProject) {
      setProjects(projects.map(p => 
        p.id === selectedProject.id ? { ...editForm as Project, id: selectedProject.id } : p
      ));
      setIsEditing(false);
    }
    setEditForm({});
    setSelectedProject(null);
  };

  const handleDelete = (projectId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setEditForm({});
    setSelectedProject(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in-progress': return 'En Ejecución';
      case 'planning': return 'En Planificación';
      default: return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'civil': return 'Obra Civil';
      case 'building': return 'Edificación';
      case 'earthworks': return 'Movimientos de Tierras';
      case 'canalizaciones': return 'Canalizaciones';
      default: return category;
    }
  };

  const stats = [
    { label: 'Total Proyectos', value: projects.length.toString(), icon: Building2, color: 'text-blue-600' },
    { label: 'Completados', value: projects.filter(p => p.status === 'completed').length.toString(), icon: CheckCircle, color: 'text-green-600' },
    { label: 'En Ejecución', value: projects.filter(p => p.status === 'in-progress').length.toString(), icon: Clock, color: 'text-blue-600' },
    { label: 'En Planificación', value: projects.filter(p => p.status === 'planning').length.toString(), icon: AlertTriangle, color: 'text-yellow-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Proyectos y Galería</h2>
          <p className="text-gray-600">Administra proyectos, fotos y contenido para la web</p>
        </div>
        <button type="button" onClick={handleCreate}
          className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Proyecto</span>
        </button>
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
                placeholder="Buscar proyectos..."
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
            {statuses.map(status => (
              <option key={status.id} value={status.id}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Lista de Proyectos</h3>
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-20 h-20 rounded-lg overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600">{project.client}</p>
                    <p className="text-xs text-gray-500">Categoría: {getCategoryLabel(project.category)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Ubicación:</span>
                  <div className="font-medium text-gray-900">{project.location}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Año:</span>
                  <div className="font-medium text-gray-900">{project.year}</div>
                </div>
                {project.budget && (
                  <div>
                    <span className="text-sm text-gray-600">Presupuesto:</span>
                    <div className="font-bold text-purple-600">€{project.budget.toLocaleString()}</div>
                  </div>
                )}
                {project.team && (
                  <div>
                    <span className="text-sm text-gray-600">Equipo:</span>
                    <div className="font-bold text-blue-600">{project.team} trabajadores</div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <span className="text-sm text-gray-600 block mb-2">Descripción:</span>
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {project.description}
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm text-gray-600 block mb-2">Detalles Técnicos:</span>
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {project.technicalDetails}
                </div>
              </div>

              {project.progress !== undefined && project.status !== 'completed' && (
                <div className="mb-4">
                  <span className="text-sm text-gray-600 block mb-2">Progreso del Proyecto:</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-corporate-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                  </div>
                </div>
              )}

              {project.startDate && project.endDate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Fecha Inicio:</span>
                    <div className="text-sm text-gray-900">{new Date(project.startDate).toLocaleDateString('es-ES')}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Fecha Fin:</span>
                    <div className="text-sm text-gray-900">{new Date(project.endDate).toLocaleDateString('es-ES')}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  ID: {project.id}
                </div>
                <div className="flex space-x-2">
                  <button type="button" onClick={() => setSelectedProject(project)}
                    className="text-corporate-blue-600 hover:text-corporate-blue-900"
                    title="Ver detalles"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => handleEdit(project)}
                    className="text-green-600 hover:text-green-900"
                    title="Editar"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && !isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
                <button type="button" onClick={() => setSelectedProject(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <img 
                src={selectedProject.image} 
                alt={selectedProject.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Proyecto</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Cliente:</strong> {selectedProject.client}</div>
                    <div><strong>Ubicación:</strong> {selectedProject.location}</div>
                    <div><strong>Año:</strong> {selectedProject.year}</div>
                    <div><strong>Categoría:</strong> {getCategoryLabel(selectedProject.category)}</div>
                    <div><strong>Estado:</strong> {getStatusLabel(selectedProject.status)}</div>
                    {selectedProject.budget && (
                      <div><strong>Presupuesto:</strong> €{selectedProject.budget.toLocaleString()}</div>
                    )}
                    {selectedProject.team && (
                      <div><strong>Equipo:</strong> {selectedProject.team} trabajadores</div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
                  <p className="text-gray-600 mb-4">{selectedProject.description}</p>
                  <h4 className="font-semibold text-gray-900 mb-2">Detalles Técnicos:</h4>
                  <p className="text-gray-600 text-sm">{selectedProject.technicalDetails}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {(isEditing || isCreating) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isCreating ? 'Crear Nuevo Proyecto' : 'Editar Proyecto'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título del Proyecto *
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
                      Cliente *
                    </label>
                    <input
                      type="text"
                      value={editForm.client || ''}
                      onChange={(e) => setEditForm({...editForm, client: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={editForm.category || 'civil'}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value as any})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    >
                      <option value="civil">Obra Civil</option>
                      <option value="building">Edificación</option>
                      <option value="earthworks">Movimientos de Tierras</option>
                      <option value="canalizaciones">Canalizaciones</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <select
                      value={editForm.status || 'planning'}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    >
                      <option value="planning">En Planificación</option>
                      <option value="in-progress">En Ejecución</option>
                      <option value="completed">Completado</option>
                    </select>
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
                      Año *
                    </label>
                    <input
                      type="text"
                      value={editForm.year || ''}
                      onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Presupuesto (€)
                    </label>
                    <input
                      type="number"
                      value={editForm.budget || ''}
                      onChange={(e) => setEditForm({...editForm, budget: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Progreso (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.progress || ''}
                      onChange={(e) => setEditForm({...editForm, progress: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Imagen *
                  </label>
                  <input
                    type="url"
                    value={editForm.image || ''}
                    onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                    placeholder="https://images.pexels.com/..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Usa URLs de Pexels o imágenes públicas. Ejemplo: https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detalles Técnicos *
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.technicalDetails || ''}
                    onChange={(e) => setEditForm({...editForm, technicalDetails: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    required
                  />
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
                    <span>{isCreating ? 'Crear Proyecto' : 'Guardar Cambios'}</span>
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

export default ProjectGallery;