import React from 'react';
import { Building2, Plus, Search, Calendar, Users, MapPin, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';

const Projects: React.FC = () => {
  const projects = [
    {
      id: 1,
      name: 'Autopista A-7 Valencia',
      client: 'Ministerio de Transportes',
      status: 'En progreso',
      progress: 75,
      budget: 2400000,
      spent: 1800000,
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      team: 45,
      location: 'Valencia, España',
      type: 'Obra Civil'
    },
    {
      id: 2,
      name: 'Edificio Residencial Marina',
      client: 'Inmobiliaria Mediterránea S.L.',
      status: 'En progreso',
      progress: 60,
      budget: 1800000,
      spent: 1080000,
      startDate: '2024-02-01',
      endDate: '2024-08-20',
      team: 32,
      location: 'Alicante, España',
      type: 'Edificación'
    },
    {
      id: 3,
      name: 'Polígono Industrial Norte',
      client: 'Ayuntamiento de Valencia',
      status: 'Planificación',
      progress: 25,
      budget: 3200000,
      spent: 800000,
      startDate: '2024-03-10',
      endDate: '2024-09-10',
      team: 28,
      location: 'Valencia, España',
      type: 'Movimientos de Tierras'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Proyectos</h2>
          <p className="text-gray-600">Administra y supervisa todos los proyectos activos</p>
        </div>
        <button className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Proyectos Activos</p>
              <p className="text-2xl font-bold text-gray-900">18</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Progreso</p>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Planificación</p>
              <p className="text-2xl font-bold text-yellow-600">4</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Con Retrasos</p>
              <p className="text-2xl font-bold text-red-600">2</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent">
            <option>Todos los estados</option>
            <option>En progreso</option>
            <option>Planificación</option>
            <option>Completado</option>
            <option>Pausado</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent">
            <option>Todos los tipos</option>
            <option>Obra Civil</option>
            <option>Edificación</option>
            <option>Movimientos de Tierras</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Lista de Proyectos</h3>
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-corporate-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.client}</p>
                    <p className="text-xs text-gray-500">Tipo: {project.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    project.status === 'En progreso' ? 'bg-green-100 text-green-800' :
                    project.status === 'Planificación' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Ubicación:</span>
                  <div className="font-medium text-gray-900">{project.location}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Equipo:</span>
                  <div className="font-bold text-blue-600">{project.team} trabajadores</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Presupuesto:</span>
                  <div className="font-bold text-purple-600">€{project.budget.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Gastado:</span>
                  <div className="font-bold text-red-600">€{project.spent.toLocaleString()}</div>
                </div>
              </div>

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

              <div className="mb-4">
                <span className="text-sm text-gray-600 block mb-2">Progreso del Proyecto:</span>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-corporate-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Progreso</span>
                  <span className="font-medium text-gray-900">{project.progress}%</span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm text-gray-600 block mb-2">Progreso Presupuestario:</span>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(project.spent / project.budget) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Ejecutado</span>
                  <span className="font-medium text-gray-900">{((project.spent / project.budget) * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <div>ID: {project.id} | Tipo: {project.type}</div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-corporate-blue-600 hover:text-corporate-blue-900" title="Ver detalles">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button className="text-green-600 hover:text-green-900" title="Editar proyecto">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button className="text-purple-600 hover:text-purple-900" title="Documentos">
                    <FileText className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;