import React, { useState } from 'react';
import { ClipboardList, Plus, Search, Calendar, Clock, User, MapPin, CheckCircle, AlertTriangle, FileText, Download } from 'lucide-react';

const WorkReports: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2024-01-31');

  const workReports = [
    {
      id: 1,
      date: '2024-01-31',
      worker: 'Juan García Martínez',
      position: 'Oficial de Albañilería',
      project: 'Autopista A-7 Valencia',
      startTime: '07:00',
      endTime: '15:00',
      totalHours: 8,
      regularHours: 8,
      overtimeHours: 0,
      activities: [
        'Colocación de encofrado en muro de contención',
        'Vertido de hormigón H-25',
        'Desencofrado y acabados'
      ],
      materials: ['Hormigón H-25: 15m³', 'Encofrado metálico: 45m²'],
      status: 'Aprobado',
      approvedBy: 'Ana Martínez',
      weather: 'Soleado',
      observations: 'Trabajo completado según planificación'
    },
    {
      id: 2,
      date: '2024-01-31',
      worker: 'María López Fernández',
      position: 'Operadora de Excavadora',
      project: 'Edificio Residencial Marina',
      startTime: '07:30',
      endTime: '16:30',
      totalHours: 9,
      regularHours: 8,
      overtimeHours: 1,
      activities: [
        'Excavación para cimentación bloque B',
        'Movimiento de tierras a vertedero',
        'Limpieza de zanjas'
      ],
      materials: ['Combustible: 45L', 'Aceite hidráulico: 2L'],
      status: 'Pendiente',
      approvedBy: null,
      weather: 'Nublado',
      observations: 'Retraso por lluvia matinal'
    },
    {
      id: 3,
      date: '2024-01-30',
      worker: 'Carlos Ruiz Sánchez',
      position: 'Soldador Especializado',
      project: 'Polígono Industrial Norte',
      startTime: '08:00',
      endTime: '17:00',
      totalHours: 9,
      regularHours: 8,
      overtimeHours: 1,
      activities: [
        'Soldadura de estructura metálica nave 3',
        'Revisión de soldaduras anteriores',
        'Preparación de materiales para mañana'
      ],
      materials: ['Electrodo E-7018: 5kg', 'Gas argón: 2 botellas'],
      status: 'Aprobado',
      approvedBy: 'Pedro González',
      weather: 'Soleado',
      observations: 'Calidad de soldadura excelente'
    },
    {
      id: 4,
      date: '2024-01-30',
      worker: 'Pedro González Ruiz',
      position: 'Gruista',
      project: 'Autopista A-7 Valencia',
      startTime: '07:00',
      endTime: '15:00',
      totalHours: 8,
      regularHours: 8,
      overtimeHours: 0,
      activities: [
        'Montaje de vigas prefabricadas',
        'Apoyo en colocación de elementos',
        'Mantenimiento preventivo grúa'
      ],
      materials: ['Combustible: 35L', 'Aceite motor: 1L'],
      status: 'Rechazado',
      approvedBy: 'Ana Martínez',
      weather: 'Ventoso',
      observations: 'Trabajo suspendido por viento excesivo'
    }
  ];

  const dailySummary = {
    date: selectedDate,
    totalWorkers: 45,
    totalHours: 368,
    regularHours: 340,
    overtimeHours: 28,
    completedTasks: 23,
    pendingTasks: 5,
    incidents: 0,
    weatherConditions: 'Soleado, 18°C'
  };

  const filteredReports = selectedFilter === 'all' 
    ? workReports.filter(report => report.date === selectedDate)
    : workReports.filter(report => {
        if (selectedFilter === 'pendiente') return report.status === 'Pendiente' && report.date === selectedDate;
        if (selectedFilter === 'aprobado') return report.status === 'Aprobado' && report.date === selectedDate;
        if (selectedFilter === 'rechazado') return report.status === 'Rechazado' && report.date === selectedDate;
        return report.date === selectedDate;
      });

  const stats = [
    { label: 'Partes del Día', value: filteredReports.length.toString(), icon: ClipboardList, color: 'text-blue-600' },
    { label: 'Horas Totales', value: filteredReports.reduce((sum, report) => sum + report.totalHours, 0).toString(), icon: Clock, color: 'text-green-600' },
    { label: 'Horas Extra', value: filteredReports.reduce((sum, report) => sum + report.overtimeHours, 0).toString(), icon: AlertTriangle, color: 'text-yellow-600' },
    { label: 'Aprobados', value: filteredReports.filter(r => r.status === 'Aprobado').length.toString(), icon: CheckCircle, color: 'text-green-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprobado': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Rechazado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Partes de Trabajo</h2>
          <p className="text-gray-600">Registro diario de actividades y horas trabajadas</p>
        </div>
        <div className="flex space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          <button className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nuevo Parte</span>
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Seleccionar Fecha</h3>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            />
            <div className="text-sm text-gray-600">
              Condiciones: {dailySummary.weatherConditions}
            </div>
          </div>
        </div>

        {/* Daily Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-corporate-blue-600">{dailySummary.totalWorkers}</div>
            <div className="text-sm text-gray-600">Trabajadores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{dailySummary.completedTasks}</div>
            <div className="text-sm text-gray-600">Tareas Completadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{dailySummary.pendingTasks}</div>
            <div className="text-sm text-gray-600">Tareas Pendientes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{dailySummary.incidents}</div>
            <div className="text-sm text-gray-600">Incidentes</div>
          </div>
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
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar trabajador o proyecto..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent">
            <option>Todos los proyectos</option>
            <option>Autopista A-7 Valencia</option>
            <option>Edificio Residencial Marina</option>
            <option>Polígono Industrial Norte</option>
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'pendiente', label: 'Pendientes' },
            { id: 'aprobado', label: 'Aprobados' },
            { id: 'rechazado', label: 'Rechazados' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-corporate-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Work Reports */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-corporate-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.worker}</h3>
                  <p className="text-sm text-gray-500">{report.position}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{report.project}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
                <div className="text-right text-sm text-gray-500">
                  <div>{report.date}</div>
                  <div>{report.weather}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              {/* Time Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Horario</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Inicio:</span>
                    <span className="font-medium">{report.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fin:</span>
                    <span className="font-medium">{report.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{report.totalHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regulares:</span>
                    <span className="font-medium">{report.regularHours}h</span>
                  </div>
                  {report.overtimeHours > 0 && (
                    <div className="flex justify-between">
                      <span>Extras:</span>
                      <span className="font-medium text-yellow-600">{report.overtimeHours}h</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Activities */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Actividades Realizadas</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {report.activities.map((activity, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-corporate-blue-500 mt-1">•</span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Materials */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Materiales Utilizados</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {report.materials.map((material, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {report.observations && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Observaciones</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{report.observations}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {report.approvedBy ? (
                  <span>{report.status === 'Aprobado' ? 'Aprobado' : 'Rechazado'} por: {report.approvedBy}</span>
                ) : (
                  <span>Pendiente de aprobación</span>
                )}
              </div>
              <div className="flex space-x-2">
                {report.status === 'Pendiente' && (
                  <>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium">
                      Aprobar
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium">
                      Rechazar
                    </button>
                  </>
                )}
                <button className="text-corporate-blue-600 hover:text-corporate-blue-900">
                  <FileText className="h-4 w-4" />
                </button>
                <button className="text-green-600 hover:text-green-900">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkReports;